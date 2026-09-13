import React, { useEffect, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';

export default function ShaderBackground() {
  const canvasRef = useRef(null);
  const { theme } = usePortfolio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();
    window.addEventListener('resize', syncSize);

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform int u_theme;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        vec2 m = u_mouse / u_resolution;

        // Fluid organic movement
        float t = u_time * 0.18;
        vec2 movement = vec2(
          sin(uv.y * 3.0 + t + sin(uv.x * 2.0 + t)),
          cos(uv.x * 3.0 + t + cos(uv.y * 2.0 + t))
        );
        uv += movement * 0.045;

        // Subtle mouse influence
        float dist = distance(v_texCoord, m);
        float influence = smoothstep(0.45, 0.0, dist);
        uv += (v_texCoord - m) * influence * 0.08;

        // Palettes
        vec3 col1 = vec3(0.047, 0.075, 0.141); // Deep Obsidian
        vec3 col2 = vec3(0.388, 0.4, 0.945);   // Electric Indigo
        vec3 col3 = vec3(0.12, 0.14, 0.22);

        if (u_theme == 1) {
          // Cyber
          col1 = vec3(0.02, 0.03, 0.08);
          col2 = vec3(0.15, 0.7, 0.95);
          col3 = vec3(0.05, 0.15, 0.3);
        } else if (u_theme == 2) {
          // Emerald
          col1 = vec3(0.02, 0.08, 0.05);
          col2 = vec3(0.2, 0.82, 0.6);
          col3 = vec3(0.05, 0.25, 0.15);
        } else if (u_theme == 3) {
          // Sunset
          col1 = vec3(0.09, 0.04, 0.08);
          col2 = vec3(0.95, 0.4, 0.55);
          col3 = vec3(0.25, 0.08, 0.18);
        } else if (u_theme == 4) {
          // Light
          col1 = vec3(0.96, 0.97, 0.99);
          col2 = vec3(0.65, 0.72, 0.95);
          col3 = vec3(0.88, 0.91, 0.98);
        }

        float noise = sin(uv.x * 4.0 + t) * cos(uv.y * 4.0 - t);
        vec3 color = mix(col1, col2, noise * 0.35 + 0.35);
        color = mix(color, col3, influence * 0.35);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(type, src) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uTheme = gl.getUniformLocation(prog, 'u_theme');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = window.innerHeight - e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animId;
    function render(t) {
      if (!canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uTheme) {
        let themeCode = 0;
        if (theme === 'cyber') themeCode = 1;
        else if (theme === 'emerald') themeCode = 2;
        else if (theme === 'sunset') themeCode = 3;
        else if (theme === 'light') themeCode = 4;
        gl.uniform1i(uTheme, themeCode);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', syncSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-50 transition-opacity duration-1000">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
