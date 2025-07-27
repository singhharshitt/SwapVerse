import React, { useEffect, useRef } from 'react';

const Squares = ({ 
  speed = 0.5, 
  squareSize = 40, 
  direction = "diagonal", 
  borderColor = "#F7F4F3", 
  hoverFillColor = "#5B2333" 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const squaresRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Square class
    class Square {
      constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.originalX = x;
        this.originalY = y;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = speed;
        this.hover = 0;
        this.hoverTarget = 0;
      }

      update(time, mouseX, mouseY) {
        // Move based on direction
        if (direction === "diagonal") {
          this.x += Math.cos(this.angle) * this.speed;
          this.y += Math.sin(this.angle) * this.speed;
        } else if (direction === "horizontal") {
          this.x += this.speed;
          this.y = this.originalY + Math.sin(time * 0.001 + this.angle) * 20;
        } else if (direction === "vertical") {
          this.x = this.originalX + Math.cos(time * 0.001 + this.angle) * 20;
          this.y += this.speed;
        }

        // Wrap around screen
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;

        // Hover effect
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.hoverTarget = Math.max(this.hoverTarget, (100 - distance) / 100);
        }
        
        this.hover += (this.hoverTarget - this.hover) * 0.1;
        this.hoverTarget *= 0.95;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const size = this.size + this.hover * 10;
        
        // Draw square
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.fillStyle = hoverFillColor;
        
        ctx.globalAlpha = 0.3 + this.hover * 0.4;
        
        ctx.beginPath();
        ctx.rect(-size/2, -size/2, size, size);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
      }
    }

    // Initialize squares
    const initSquares = () => {
      squaresRef.current = [];
      const cols = Math.ceil(canvas.width / squareSize);
      const rows = Math.ceil(canvas.height / squareSize);
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * squareSize + squareSize/2;
          const y = j * squareSize + squareSize/2;
          squaresRef.current.push(new Square(x, y, squareSize * 0.6));
        }
      }
    };

    initSquares();

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw squares
      squaresRef.current.forEach(square => {
        square.update(time, mouseRef.current.x, mouseRef.current.y);
        square.draw(ctx);
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse move handler
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, squareSize, direction, borderColor, hoverFillColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        opacity: 0.3,
        pointerEvents: 'none'
      }}
    />
  );
};

export default Squares; 