import { useEffect, useRef } from 'react'
import { useViewportVisibility } from '../../hooks/useViewportVisibility'

/**
 * SilkBackground — React port of inspira-ui's SilkBackground.vue
 * Uses raw WebGL2 to render the silk shader (ShaderToy: X3yXRd)
 * No extra dependencies required.
 */

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`

const FRAG_HEADER = `#version 300 es
precision highp float;
uniform vec3  iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform int   iFrame;
uniform vec4  iMouse;
uniform vec3  iHSV;
uniform float iSpeed;
out vec4 fragColor;

vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);
  vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);
  return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);
}
vec3 rgb2hsv(vec3 c){
  vec4 K=vec4(0.0,-1.0/3.0,2.0/3.0,-1.0);
  vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));
  vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));
  float d=q.x-min(q.w,q.y);
  float e=1.0e-10;
  return vec3(abs(q.z+(q.w-q.y)/(6.0*d+e)),d/(q.x+e),q.x);
}
vec3 applyHSV(vec3 color,vec3 adj){
  vec3 h=rgb2hsv(color);
  h.x=fract(h.x+adj.x/360.0);
  h.y=clamp(h.y*adj.y,0.0,1.0);
  h.z=clamp(h.z*adj.z,0.0,1.0);
  return hsv2rgb(h);
}
void mainImage(out vec4 c,in vec2 f);
void main(){
  vec4 color=vec4(0,0,0,1);
  mainImage(color,gl_FragCoord.xy);
  if(iHSV.x!=0.0||iHSV.y!=1.0||iHSV.z!=1.0)
    color.rgb=applyHSV(color.rgb,iHSV);
  fragColor=color;
}`

// ShaderToy X3yXRd — Silk by Giorgi Azmaipharashvili (MIT License)
const SILK = `
#define INVERT 1
float noise(vec2 p){
  return smoothstep(-0.5,0.9,sin((p.x-p.y)*555.0)*sin(p.y*1444.0))-0.4;
}
float fabric(vec2 p){
  const mat2 m=mat2(1.6,1.2,-1.2,1.6);
  float f=0.4*noise(p);
  f+=0.3*noise(p=m*p);
  f+=0.2*noise(p=m*p);
  return f+0.1*noise(m*p);
}
float silk(vec2 uv,float t){
  float s=sin(5.0*(uv.x+uv.y+cos(2.0*uv.x+5.0*uv.y))+sin(12.0*(uv.x+uv.y))-t);
  s=0.7+0.3*(s*s*0.5+s);
  s*=0.9+0.6*fabric(uv*min(iResolution.x,iResolution.y)*0.0006);
  return s*0.9+0.1;
}
float silkd(vec2 uv,float t){
  float xy=uv.x+uv.y;
  float d=(5.0*(1.0-2.0*sin(2.0*uv.x+5.0*uv.y))+12.0*cos(12.0*xy))*cos(5.0*(cos(2.0*uv.x+5.0*uv.y)+xy)+sin(12.0*xy)-t);
  return 0.005*d*(sign(d)+3.0);
}
void mainImage(out vec4 fragColor,vec2 fragCoord){
  float mr=min(iResolution.x,iResolution.y);
  vec2 uv=fragCoord/mr;
  float t=iTime;
  uv.y+=0.03*sin(8.0*uv.x-t);
  if(iMouse.z>1.0)
    uv+=smoothstep(0.5,0.0,distance(iMouse.xy/mr,uv))*0.08;
  float s=sqrt(silk(uv,t));
  float d=silkd(uv,t);
  vec3 c=vec3(s);
  c+=0.7*vec3(1,0.83,0.6)*d;
  c*=1.0-max(0.0,0.8*d);
#if INVERT
  c=pow(c,0.3/vec3(0.52,0.5,0.4));
  c=1.0-c;
#else
  c=pow(c,vec3(0.52,0.5,0.4));
#endif
  fragColor=vec4(c,1);
}`

function compileShader(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export default function SilkBackground({
  hue = 270,          // purple to match site
  saturation = 0.7,
  brightness = 0.85,
  speed = 0.6,
  style = {},
}) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const isVisibleRef = useViewportVisibility(wrapperRef)
  const glRef = useRef(null)
  const progRef = useRef(null)
  const uniRef = useRef({})
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const frameRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0, cx: 0, cy: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' })
    if (!gl) return
    glRef.current = gl

    // Compile
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_HEADER + SILK)
    if (!vs || !fs) return

    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Link error:', gl.getProgramInfoLog(prog))
      return
    }
    progRef.current = prog

    // Fullscreen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1,-1,1,1,-1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    // Cache uniform locations
    gl.useProgram(prog)
    uniRef.current = {
      iResolution: gl.getUniformLocation(prog, 'iResolution'),
      iTime:       gl.getUniformLocation(prog, 'iTime'),
      iTimeDelta:  gl.getUniformLocation(prog, 'iTimeDelta'),
      iFrame:      gl.getUniformLocation(prog, 'iFrame'),
      iMouse:      gl.getUniformLocation(prog, 'iMouse'),
      iHSV:        gl.getUniformLocation(prog, 'iHSV'),
      iSpeed:      gl.getUniformLocation(prog, 'iSpeed'),
    }

    // Resize handler
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = canvas.offsetWidth * dpr
      const h = canvas.offsetHeight * dpr
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Mouse handler
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio
      mouseRef.current.x = (e.clientX - rect.left) * dpr
      mouseRef.current.y = canvas.height - (e.clientY - rect.top) * dpr
    }
    canvas.addEventListener('mousemove', onMouseMove)

    // Render loop
    startRef.current = performance.now()
    let prevTime = 0

    function render() {
      rafRef.current = requestAnimationFrame(render)
      if (!isVisibleRef.current) return

      const now = (performance.now() - startRef.current) * 0.001 * speed
      const delta = now - prevTime
      prevTime = now

      const u = uniRef.current
      gl.uniform3f(u.iResolution, canvas.width, canvas.height, window.devicePixelRatio)
      gl.uniform1f(u.iTime, now)
      gl.uniform1f(u.iTimeDelta, delta)
      gl.uniform1i(u.iFrame, frameRef.current++)
      gl.uniform4f(u.iMouse, mouseRef.current.x, mouseRef.current.y, 0, 0)
      gl.uniform3f(u.iHSV, hue, saturation, brightness)
      gl.uniform1f(u.iSpeed, speed)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    render()

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('mousemove', onMouseMove)
      ro.disconnect()
    }
  }, [hue, saturation, brightness, speed])

  return (
    <div ref={wrapperRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
          ...style,
        }}
      />
    </div>
  )
}
