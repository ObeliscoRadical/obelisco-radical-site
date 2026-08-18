"""
Test suite for POST /api/public/site/inbound endpoint
Tests content publishing from external apps (CEO AI) to site_content_entries collection

Features tested:
- 401 when X-Site-Publish-Secret header is missing or incorrect
- operation=upsert creates/updates entry and returns {ok: true, entry: {...}}
- operation=delete removes entry and returns {ok: true, entry: {...}}
- 404 when deleting non-existent entry
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ENDPOINT = f"{BASE_URL}/api/public/site/inbound"
VALID_SECRET = "local-site-publish-secret"


class TestSiteInboundAuth:
    """Test authentication for site inbound endpoint"""

    def test_missing_secret_returns_401(self):
        """Request without X-Site-Publish-Secret header should return 401"""
        payload = {
            "operation": "upsert",
            "remote_entry_id": "test-entry-1",
            "slug": "test-slug-1",
            "title": "Test Title"
        }
        response = requests.post(ENDPOINT, json=payload)
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Missing secret returns 401: {data['detail']}")

    def test_wrong_secret_returns_401(self):
        """Request with incorrect X-Site-Publish-Secret header should return 401"""
        payload = {
            "operation": "upsert",
            "remote_entry_id": "test-entry-2",
            "slug": "test-slug-2",
            "title": "Test Title"
        }
        headers = {"X-Site-Publish-Secret": "wrong-secret-value"}
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong secret returns 401: {data['detail']}")

    def test_empty_secret_returns_401(self):
        """Request with empty X-Site-Publish-Secret header should return 401"""
        payload = {
            "operation": "upsert",
            "remote_entry_id": "test-entry-3",
            "slug": "test-slug-3",
            "title": "Test Title"
        }
        headers = {"X-Site-Publish-Secret": ""}
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ Empty secret returns 401")


class TestSiteInboundUpsert:
    """Test upsert operation for site inbound endpoint"""

    def test_upsert_creates_new_entry(self):
        """Upsert with valid secret creates new entry and returns ok:true with entry data"""
        unique_id = f"test-create-{uuid.uuid4().hex[:8]}"
        unique_slug = f"test-slug-create-{uuid.uuid4().hex[:8]}"
        
        payload = {
            "operation": "upsert",
            "remote_entry_id": unique_id,
            "kind": "article",
            "title": "Test Article Title",
            "slug": unique_slug,
            "excerpt": "This is a test excerpt",
            "intro": "This is the intro paragraph",
            "sections": [{"heading": "Section 1", "content": "Section content"}],
            "seo_keyword": "test keyword",
            "seo_title": "SEO Title",
            "seo_description": "SEO Description",
            "strategy_reason": "Testing strategy",
            "objective": "Test objective",
            "campaign_label": "test-campaign",
            "source_app": "CEO AI",
            "source_company_name": "Test Company"
        }
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert data.get("ok") is True, f"Expected ok:true, got {data}"
        assert "entry" in data, "Response should contain 'entry' field"
        
        entry = data["entry"]
        # Validate entry fields
        assert entry.get("remote_entry_id") == unique_id
        assert entry.get("slug") == unique_slug
        assert entry.get("title") == "Test Article Title"
        assert entry.get("kind") == "article"
        assert entry.get("excerpt") == "This is a test excerpt"
        assert entry.get("source_app") == "CEO AI"
        assert "id" in entry, "Entry should have an 'id' field"
        assert "created_at" in entry, "Entry should have 'created_at' field"
        assert "updated_at" in entry, "Entry should have 'updated_at' field"
        
        print(f"✓ Upsert creates new entry with id: {entry['id']}")
        
        # Store for cleanup
        return entry["id"], unique_id, unique_slug

    def test_upsert_updates_existing_entry(self):
        """Upsert with existing remote_entry_id updates the entry"""
        unique_id = f"test-update-{uuid.uuid4().hex[:8]}"
        unique_slug = f"test-slug-update-{uuid.uuid4().hex[:8]}"
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        
        # First create an entry
        payload_create = {
            "operation": "upsert",
            "remote_entry_id": unique_id,
            "slug": unique_slug,
            "title": "Original Title",
            "kind": "article"
        }
        response1 = requests.post(ENDPOINT, json=payload_create, headers=headers)
        assert response1.status_code == 200, f"Create failed: {response1.text}"
        entry1 = response1.json()["entry"]
        original_id = entry1["id"]
        original_created_at = entry1["created_at"]
        
        # Now update the same entry
        payload_update = {
            "operation": "upsert",
            "remote_entry_id": unique_id,
            "slug": unique_slug,
            "title": "Updated Title",
            "kind": "blog",
            "excerpt": "New excerpt added"
        }
        response2 = requests.post(ENDPOINT, json=payload_update, headers=headers)
        assert response2.status_code == 200, f"Update failed: {response2.text}"
        
        data = response2.json()
        assert data.get("ok") is True
        
        entry2 = data["entry"]
        # Verify it's the same entry (same id, same created_at)
        assert entry2["id"] == original_id, "Entry ID should remain the same on update"
        assert entry2["created_at"] == original_created_at, "created_at should not change on update"
        
        # Verify fields were updated
        assert entry2["title"] == "Updated Title"
        assert entry2["kind"] == "blog"
        assert entry2["excerpt"] == "New excerpt added"
        
        print(f"✓ Upsert updates existing entry, id preserved: {original_id}")

    def test_upsert_requires_remote_entry_id_or_slug(self):
        """Upsert without remote_entry_id or slug should return 400"""
        payload = {
            "operation": "upsert",
            "title": "Test Title Without ID"
        }
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        print("✓ Upsert without remote_entry_id or slug returns 400")


class TestSiteInboundDelete:
    """Test delete operation for site inbound endpoint"""

    def test_delete_existing_entry(self):
        """Delete operation removes entry and returns ok:true with deleted entry data"""
        unique_id = f"test-delete-{uuid.uuid4().hex[:8]}"
        unique_slug = f"test-slug-delete-{uuid.uuid4().hex[:8]}"
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        
        # First create an entry to delete
        payload_create = {
            "operation": "upsert",
            "remote_entry_id": unique_id,
            "slug": unique_slug,
            "title": "Entry to Delete",
            "kind": "article"
        }
        response_create = requests.post(ENDPOINT, json=payload_create, headers=headers)
        assert response_create.status_code == 200, f"Create failed: {response_create.text}"
        created_entry = response_create.json()["entry"]
        
        # Now delete the entry
        payload_delete = {
            "operation": "delete",
            "remote_entry_id": unique_id,
            "slug": unique_slug
        }
        response_delete = requests.post(ENDPOINT, json=payload_delete, headers=headers)
        
        assert response_delete.status_code == 200, f"Expected 200, got {response_delete.status_code}: {response_delete.text}"
        data = response_delete.json()
        
        assert data.get("ok") is True, f"Expected ok:true, got {data}"
        assert "entry" in data, "Response should contain 'entry' field"
        
        deleted_entry = data["entry"]
        # Verify deleted entry contains original data plus deletion markers
        assert deleted_entry.get("id") == created_entry["id"]
        assert deleted_entry.get("title") == "Entry to Delete"
        assert deleted_entry.get("operation") == "delete"
        assert deleted_entry.get("deleted") is True
        assert "deleted_at" in deleted_entry
        
        print(f"✓ Delete returns ok:true with deleted entry data")

    def test_delete_nonexistent_entry_returns_404(self):
        """Delete operation on non-existent entry returns 404"""
        unique_id = f"nonexistent-{uuid.uuid4().hex[:8]}"
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        
        payload = {
            "operation": "delete",
            "remote_entry_id": unique_id
        }
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Delete non-existent entry returns 404: {data['detail']}")

    def test_delete_already_deleted_entry_returns_404(self):
        """Deleting an already deleted entry returns 404"""
        unique_id = f"test-double-delete-{uuid.uuid4().hex[:8]}"
        unique_slug = f"test-slug-double-delete-{uuid.uuid4().hex[:8]}"
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        
        # Create entry
        payload_create = {
            "operation": "upsert",
            "remote_entry_id": unique_id,
            "slug": unique_slug,
            "title": "Entry to Double Delete"
        }
        requests.post(ENDPOINT, json=payload_create, headers=headers)
        
        # First delete
        payload_delete = {
            "operation": "delete",
            "remote_entry_id": unique_id
        }
        response1 = requests.post(ENDPOINT, json=payload_delete, headers=headers)
        assert response1.status_code == 200, f"First delete failed: {response1.text}"
        
        # Second delete should return 404
        response2 = requests.post(ENDPOINT, json=payload_delete, headers=headers)
        assert response2.status_code == 404, f"Expected 404 on second delete, got {response2.status_code}"
        print("✓ Second delete on same entry returns 404")


class TestSiteInboundEdgeCases:
    """Test edge cases for site inbound endpoint"""

    def test_upsert_with_only_slug(self):
        """Upsert with only slug (no remote_entry_id) should work"""
        unique_slug = f"only-slug-{uuid.uuid4().hex[:8]}"
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        
        payload = {
            "operation": "upsert",
            "slug": unique_slug,
            "title": "Entry with only slug"
        }
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("ok") is True
        assert data["entry"]["slug"] == unique_slug
        print(f"✓ Upsert with only slug works")

    def test_upsert_with_only_remote_entry_id(self):
        """Upsert with only remote_entry_id (no slug) should work"""
        unique_id = f"only-remote-id-{uuid.uuid4().hex[:8]}"
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        
        payload = {
            "operation": "upsert",
            "remote_entry_id": unique_id,
            "title": "Entry with only remote_entry_id"
        }
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("ok") is True
        assert data["entry"]["remote_entry_id"] == unique_id
        print(f"✓ Upsert with only remote_entry_id works")

    def test_upsert_with_sections_array(self):
        """Upsert with complex sections array should preserve structure"""
        unique_id = f"test-sections-{uuid.uuid4().hex[:8]}"
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        
        sections = [
            {"heading": "Introduction", "content": "Intro content", "order": 1},
            {"heading": "Main Body", "content": "Body content", "order": 2},
            {"heading": "Conclusion", "content": "Conclusion content", "order": 3}
        ]
        
        payload = {
            "operation": "upsert",
            "remote_entry_id": unique_id,
            "slug": f"sections-test-{unique_id}",
            "title": "Article with Sections",
            "sections": sections
        }
        response = requests.post(ENDPOINT, json=payload, headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("ok") is True
        
        saved_sections = data["entry"].get("sections")
        assert saved_sections is not None, "Sections should be saved"
        assert len(saved_sections) == 3, f"Expected 3 sections, got {len(saved_sections)}"
        assert saved_sections[0]["heading"] == "Introduction"
        print("✓ Upsert preserves complex sections array")

    def test_delete_by_slug_only(self):
        """Delete using only slug should work"""
        unique_slug = f"delete-by-slug-{uuid.uuid4().hex[:8]}"
        headers = {"X-Site-Publish-Secret": VALID_SECRET}
        
        # Create entry
        payload_create = {
            "operation": "upsert",
            "slug": unique_slug,
            "title": "Delete by slug test"
        }
        requests.post(ENDPOINT, json=payload_create, headers=headers)
        
        # Delete by slug only
        payload_delete = {
            "operation": "delete",
            "slug": unique_slug
        }
        response = requests.post(ENDPOINT, json=payload_delete, headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.json().get("ok") is True
        print("✓ Delete by slug only works")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
