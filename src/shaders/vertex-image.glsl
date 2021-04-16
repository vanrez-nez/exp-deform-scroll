varying vec2 vUv;
uniform float uForce;

void main() {
  vUv = uv;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vec3 point = vec3(mvPos.x, 0.0, mvPos.z);
  float dist = pow(distance(point, mvPos.xyz) * 5.0, 2.0) * uForce;
  dist = clamp(dist * 0.008, -20., 20.);
  mvPos.z += dist;
  gl_Position = projectionMatrix * mvPos;
}