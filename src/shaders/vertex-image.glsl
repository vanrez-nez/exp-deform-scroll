varying vec2 vUv;
uniform float uForce;

void main() {
  vUv = uv;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vec3 point = vec3(0., 0.0, 0.0);
  float dist = pow(distance(point, mvPos.xyz) * 5.0 * uForce, 2.0);
  dist = clamp(dist * 0.001, -10., 10.);
  mvPos.z += dist;
  gl_Position = projectionMatrix * mvPos;
}