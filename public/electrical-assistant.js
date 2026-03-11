(function () {

    const button = document.createElement("div");
  
    button.innerHTML = "⚡";
    button.style.position = "fixed";
    button.style.bottom = "90px";
    button.style.right = "20px";
    button.style.width = "60px";
    button.style.height = "60px";
    button.style.borderRadius = "50%";
    button.style.background = "#facc15";
    button.style.color = "#000";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.fontSize = "28px";
    button.style.cursor = "pointer";
    button.style.zIndex = "9999";
    button.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
  
    document.body.appendChild(button);
  
    button.onclick = () => {
      window.open(
        "https://wa.me/351911132401?text=Olá,%20gostaria%20de%20pedir%20um%20orçamento.",
        "_blank"
      );
    };
  
  })();