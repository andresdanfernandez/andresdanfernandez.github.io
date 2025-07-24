import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Html, SoftShadows, shaderMaterial, Text } from '@react-three/drei';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import glsl from 'babel-plugin-glsl/macro';
import React from 'react'; 

const icons = [
  {
    id: 'about',
    label: 'About',
    position: [-3, 0, 0],
    color: '#b97a56',
    planetData: {
      name: 'Ryland',
      type: 'Terrestrial',
      discovery: '2024',
      distance: '1.2 AU',
      diameter: '12,742 km',
      gravity: '9.8 m/s²',
      description: 'A rocky planet with a stable atmosphere and signs of intelligent life.'
    },
    personal: 'Hi! I’m Andres Fernandez, a software engineer passionate about building cool and interesting software. I have experience in full-stack development and love learning new technolgies. When I am not learning or programming I\'m playing video games or reading. Check out my resume below!'
  },
  {
    id: 'projects',
    label: 'Projects',
    position: [0, 0, 0],
    color: '#c2b280',
    planetData: {
      name: 'Grace',
      type: 'Gas Giant',
      discovery: '2022',
      distance: '5.6 AU',
      diameter: '139,822 km',
      gravity: '24.8 m/s²',
      description: 'A massive planet with swirling storms and a complex ring system.'
    },
    projects: [
      {
        name: 'Portfolio Website',
        description: 'This site!',
        technologies: ['React', 'Three.js', 'JavaScript']
      },
      {
        name: 'File Upload',
        description: 'A web app to upload and save files.',
        technologies: ['Go', 'JavaScript', 'React', 'PostgreSQL', 'AWS S3', 'Supabase', 'Github Actions', 'Nginx']
      },
      {
        name: 'Research Index',
        description: 'A web app to track and store research papers.',
        technologies: ['React', 'Node.js', 'Express', 'JavaScript', 'MongoDB']
      },
      {
        name: 'Flashcard Generator',
        description: 'Program that takes in information and generates flashcards.',
        technologies: ['Python']
      }
    ]
  },
  {
    id: 'contact',
    label: 'Contact',
    position: [3, 0, 0],
    color: '#4e6e8e',
    planetData: {
      name: 'Strattum',
      type: 'Ice Giant',
      discovery: '2023',
      distance: '19.8 AU',
      diameter: '50,724 km',
      gravity: '11.2 m/s²',
      description: 'A cold, distant planet with a blue hue and mysterious magnetic field.'
    },
    personal: 'Want to reach out?\nEmail: andyf9903@gmail.com\n Check me out on LinkedIn! \n'
  },
];

const noiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.y;
  vec4 y = y_ *ns.x + ns.y;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
`;

const PlanetMaterial = shaderMaterial(
  { baseColor: new THREE.Color(), time: 0 },
  glsl`
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  glsl`
    uniform vec3 baseColor;
    uniform float time;
    varying vec3 vPosition;
    ${noiseGLSL}
    void main() {
      float n = snoise(vPosition * 2.0 + time * 0.1);
      float rocky = smoothstep(0.0, 1.0, n * 0.5 + 0.5);
      vec3 color = mix(baseColor * 0.7, baseColor, rocky);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);
extend({ PlanetMaterial });

function Starfield({ count = 1200 }) {
  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push([
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.2) * 40 - 4
      ]);
    }
    return arr;
  }, [count]);
  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      ))}
    </group>
  );
}

function FacetedOrb({ label, position, color, onClick, disabled, showLabel }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.position.y = position[1] + Math.sin(t + position[0]) * 0.28;
    mesh.current.rotation.y = t * 0.5 + position[0];
    mesh.current.rotation.x = Math.sin(t + position[0]) * 0.1;
    if (mesh.current.material) {
      mesh.current.material.time = t;
    }
  });
  return (
    <group ref={mesh} position={position}>
      <mesh
        onClick={disabled ? undefined : onClick}
        castShadow
        receiveShadow
        scale={hovered && !disabled ? 1.15 : 1}
        onPointerOver={() => !disabled && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        style={{ cursor: disabled ? 'default' : 'pointer' }}
      >
        <icosahedronGeometry args={[0.9, 1]} />
        <planetMaterial attach="material" baseColor={new THREE.Color(color)} />
      </mesh>
      {showLabel && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none', fontFamily: 'Space Grotesk', fontWeight: 700, color: '#fff', fontSize: 22, textShadow: '0 2px 8px #0008' }}>
          {label}
        </Html>
      )}
    </group>
  );
}

function FloatingName() {
  const letters = 'Andres Fernandez'.split('');
  const baseY = 2.5;
  const baseZ = 0;
  const spacing = 0.45;
  const startX = -((letters.length - 1) * spacing) / 2;

  // UseRef for real-time physics state
  const letterStates = useRef(
    letters.map((char, i) => ({
      pos: new THREE.Vector3(startX + i * spacing, baseY, baseZ),
      vel: new THREE.Vector3(0, 0, 0),
      rest: new THREE.Vector3(startX + i * spacing, baseY, baseZ),
      hasBeenPushed: false,
    }))
  );

  const [, setTick] = useState(0);

  // tracking mouse movement
  const { camera, gl, size } = useThree();
  const mouse = useRef(new THREE.Vector2());
  const prevMouse = useRef(new THREE.Vector2());
  const mouseWorld = useRef(new THREE.Vector3());
  const prevMouseWorld = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const letterRefs = useRef([]);

  // mouse move handler
  React.useEffect(() => {
    function onPointerMove(e) {

      const x = (e.clientX / size.width) * 2 - 1;
      const y = -(e.clientY / size.height) * 2 + 1;
      prevMouse.current.copy(mouse.current);
      mouse.current.set(x, y);
    }
    gl.domElement.addEventListener('pointermove', onPointerMove);
    return () => gl.domElement.removeEventListener('pointermove', onPointerMove);
  }, [gl, size]);

  function getMouseWorld(vec2) {
    const ndc = new THREE.Vector3(vec2.x, vec2.y, 0.5); // z=0.5 for ray
    raycaster.current.setFromCamera(vec2, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -baseZ);
    const intersection = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane, intersection);
    return intersection;
  }

  // Physics and collision
  useFrame(() => {
    const currWorld = getMouseWorld(mouse.current);
    const prevWorld = getMouseWorld(prevMouse.current);
    mouseWorld.current.copy(currWorld);
    prevMouseWorld.current.copy(prevWorld);

    letterStates.current.forEach((state) => {
      state.pos.x += state.vel.x;
      state.pos.y += state.vel.y;
      state.pos.z = baseZ;
      state.vel.x *= 0.96;
      state.vel.y *= 0.96;
      state.vel.z = 0;
      if (Math.abs(state.vel.x) < 0.001) state.vel.x = 0;
      if (Math.abs(state.vel.y) < 0.001) state.vel.y = 0;
      if (!state.hasBeenPushed && (Math.abs(state.vel.x) > 0.001 || Math.abs(state.vel.y) > 0.001)) {
        state.hasBeenPushed = true;
      }
    });

    raycaster.current.setFromCamera(mouse.current, camera);
    for (let i = 0; i < letters.length; i++) {
      const ref = letterRefs.current[i];
      if (!ref) continue;
      const letterPos = letterStates.current[i].pos;
      const dist = Math.sqrt(
        Math.pow(mouseWorld.current.x - letterPos.x, 2) +
        Math.pow(mouseWorld.current.y - letterPos.y, 2)
      );
      if (dist < 0.35) {
        const dx = mouseWorld.current.x - prevMouseWorld.current.x;
        const dy = mouseWorld.current.y - prevMouseWorld.current.y;
        if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
          const pushStrength = 0.7; 
          letterStates.current[i].vel.x += dx * pushStrength;
          letterStates.current[i].vel.y += dy * pushStrength;
          letterStates.current[i].vel.z = 0;
        }
      }
    }
    prevMouse.current.copy(mouse.current);
    setTick(t => t + 1);
  });

  const nameCenter = [0, baseY, baseZ];

  return (
    <group>
      {letters.map((char, i) => {
        const state = letterStates.current[i];
        let x = state.pos.x;
        let y = state.pos.y;
        if (!state.hasBeenPushed) {
          const t = performance.now() / 1000;
          x += Math.sin(t * 2 + i) * 0.04;
          y += Math.cos(t * 2.2 + i * 1.3) * 0.04;
        }
        return (
          <Text
            key={i}
            ref={el => (letterRefs.current[i] = el)}
            position={[x, y, baseZ]}
            fontSize={0.55}
            color="#fff"
            anchorY="middle"
            anchorX="center"
            style={{ cursor: 'pointer', textShadow: '0 2px 8px #0008' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </Text>
        );
      })}
    </group>
  );
}

function BottomHint() {
  return (
    <Text
      position={[0, -2.7, 0]}
      fontSize={0.32}
      color="#60a5fa"
      anchorX="center"
      anchorY="middle"
      letterSpacing={-0.01}
    >
      Click planets in the system to explore!
    </Text>
  );
}

function SaturnRing({ planetPosition }) {
  const ringRef = useRef();
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.003;
    }
  });
  return (
    <mesh
      ref={ringRef}
      position={planetPosition}
      rotation={[Math.PI / 2.2, 0, Math.PI / 7]}
    >
      <torusGeometry args={[1.25, 0.13, 2, 80]} />
      <meshStandardMaterial
        color="#e5e7eb"
        transparent
        opacity={0.45}
        roughness={0.6}
        metalness={0.2}
      />
    </mesh>
  );
}

function OrbitingMoon({ center, radius, speed, size = 0.18, color = '#e5e7eb', phase = 0, label, url }) {
  const moonRef = useRef();
  const [hovered, setHovered] = useState(false);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const angle = t * speed + phase;
    moonRef.current.position.x = center[0] + Math.cos(angle) * radius;
    moonRef.current.position.y = center[1] + Math.sin(angle) * radius;
    moonRef.current.position.z = center[2];
  });
  return (
    <group ref={moonRef}>
      <mesh
        castShadow
        receiveShadow
        scale={hovered ? 1.18 : 1}
        onPointerOver={url ? () => setHovered(true) : undefined}
        onPointerOut={url ? () => setHovered(false) : undefined}
        onClick={url ? () => window.open(url, '_blank', 'noopener,noreferrer') : undefined}
        style={url ? { cursor: 'pointer' } : undefined}
      >
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial color={color} roughness={0.92} metalness={0.13} flatShading emissive={hovered ? '#60a5fa' : '#000'} emissiveIntensity={hovered ? 0.5 : 0} />
      </mesh>
      {label && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none', fontFamily: 'Space Grotesk', fontWeight: 700, color: hovered ? '#60a5fa' : '#fff', fontSize: 16, textShadow: '0 2px 8px #0008', marginTop: 8 }}>
          {label}
        </Html>
      )}
    </group>
  );
}

function CameraController({ selectedPlanet, setCameraDone, reset }) {
  const { camera } = useThree();
  const initial = useRef({ position: new THREE.Vector3(0, 0, 8), lookAt: new THREE.Vector3(0, 0, 0) });
  useFrame(() => {
    if (selectedPlanet) {
      const target = new THREE.Vector3(...selectedPlanet.position);
      target.z += 1.7;
      camera.position.lerp(target, 0.08);
      camera.lookAt(...selectedPlanet.position);
      if (camera.position.distanceTo(target) < 0.05) {
        setCameraDone(true);
      }
    } else {
      // Animate back to initial position and lookAt
      camera.position.lerp(initial.current.position, 0.08);
      camera.lookAt(initial.current.lookAt);
    }
  });
  return null;
}

function InfoOverlay({ planet, onBack }) {
  const { planetData, personal, projects } = planet;
  const isAbout = planet.id === 'about';
  const isProjects = planet.id === 'projects';
  const isContact = planet.id === 'contact';
  let contactPersonal = personal;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      flexDirection: 'column',
    }}>
      <div style={{
        background: '#181c24',
        color: '#fff',
        borderRadius: 16,
        padding: '2rem 2rem 1.5rem 2rem',
        minWidth: 340,
        maxWidth: isProjects ? 500 : 420,
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px #000a',
        textAlign: 'left',
      }}>
        <h2 style={{ fontSize: 32, marginBottom: 18, textAlign: 'center' }}>{planet.label}</h2>
        {/* NASA-style planet data */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#7dd3fc', letterSpacing: 1 }}>Classification</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}><b>Name:</b> {planetData.name}</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}><b>Type:</b> {planetData.type}</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}><b>Discovery Year:</b> {planetData.discovery}</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}><b>Distance from Sun:</b> {planetData.distance}</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}><b>Diameter:</b> {planetData.diameter}</div>
          <div style={{ fontSize: 16, marginBottom: 4 }}><b>Gravity:</b> {planetData.gravity}</div>
          <div style={{ fontSize: 16, marginTop: 8, color: '#a5b4fc' }}>{planetData.description}</div>
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#fbbf24', letterSpacing: 1 }}>Mission Log</div>
        {isProjects ? (
          <div style={{ fontSize: 16, marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#fbbf24' }}>Featured Projects:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {planet.projects.map((project, index) => (
                <div key={index} style={{ 
                  border: '1px solid #374151', 
                  borderRadius: 10, 
                  padding: 12, 
                  background: 'rgba(55, 65, 81, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#60a5fa', fontSize: 16, lineHeight: 1.2 }}>•</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: '#e5e7eb', fontSize: 15 }}>{project.name}:</span>
                      <span style={{ color: '#a5b4fc', fontSize: 13 }}> {project.description}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: 24 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#fbbf24', 
                      fontSize: 13, 
                      marginBottom: 4,
                      letterSpacing: 0.5
                    }}>
                      Technologies:
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 4 
                    }}>
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} style={{
                          background: 'rgba(96, 165, 250, 0.2)',
                          color: '#60a5fa',
                          padding: '3px 6px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 500,
                          border: '1px solid rgba(96, 165, 250, 0.3)',
                          backdropFilter: 'blur(5px)'
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 16, whiteSpace: 'pre-line', marginBottom: 24 }}>
            {isAbout ? (
              <>
                <div>Hi, I'm Andres Fernandez, a motivated Computer Science student with hands-on experience in full-stack development, database management, and deploying modern web applications. I am a quick learner, team player, and I enjoy solving problems that have an impact.</div>
                <div style={{ 
                  color: '#fbbf24', 
                  fontWeight: 700, 
                  fontSize: 18, 
                  marginTop: 12,
                  letterSpacing: 0.5
                }}> Check out my resume below!
                </div>
              </>
            ) : (
              isContact ? contactPersonal : personal
            )}
          </div>
        )}
        {isContact && (
          <div style={{ fontSize: 16, marginBottom: 18, color: '#60a5fa', fontWeight: 700 }}>
            <span style={{ marginRight: 8 }}>📞</span> (305) 508-8968
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', marginTop: 8 }}>
          {isAbout && (
            <a
              href="https://drive.google.com/file/d/1kaPXpUA4kKN41s9Wx253zhUg3igiHBZh/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fbbf24',
                color: '#181c24',
                borderRadius: 8,
                padding: '0.6rem 1.5rem',
                fontWeight: 700,
                fontSize: 18,
                textDecoration: 'none',
                boxShadow: '0 2px 8px #0004',
                transition: 'background 0.2s',
              }}
            >
              📄 Resume
            </a>
          )}
          {isProjects && (
            <a
              href="https://github.com/andresdanfernandez"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#181c24',
                color: '#fff',
                border: '2px solid #60a5fa',
                borderRadius: 8,
                padding: '0.6rem 1.5rem',
                fontWeight: 700,
                fontSize: 18,
                textDecoration: 'none',
                boxShadow: '0 2px 8px #0004',
                transition: 'background 0.2s',
                gap: 10,
              }}
            >
              <svg height="22" viewBox="0 0 16 16" width="22" fill="#60a5fa" style={{ marginRight: 8, verticalAlign: 'middle' }} aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
          )}
          {isContact && (
            <a
              href="https://linkedin.com/in/andresdfernandez"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#2563eb',
                color: '#fff',
                border: '2px solid #60a5fa',
                borderRadius: 8,
                padding: '0.6rem 1.5rem',
                fontWeight: 700,
                fontSize: 18,
                textDecoration: 'none',
                boxShadow: '0 2px 8px #0004',
                transition: 'background 0.2s',
                gap: 10,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" style={{ marginRight: 8, verticalAlign: 'middle' }} aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.597 2.001 3.597 4.6v5.596z"/>
              </svg>
              LinkedIn
            </a>
          )}
          <button onClick={onBack} style={{
            background: '#fff',
            color: '#181c24',
            border: 'none',
            borderRadius: 8,
            padding: '0.75rem 2rem',
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0004',
          }}>Back</button>
        </div>
      </div>
    </div>
  );
}

function Scene({ selectedPlanet, setSelectedPlanet, cameraDone, setCameraDone }) {
  const handleIconClick = (id) => {
    if (!selectedPlanet) {
      setSelectedPlanet(icons.find((icon) => icon.id === id));
      setCameraDone(false);
    }
  };
  return (
    <>
      <Starfield count={1200} />
      <SoftShadows size={20} samples={16} focus={0.95} />
      <ambientLight intensity={0.7} />
      {!selectedPlanet && <FloatingName />}
      {!selectedPlanet && <BottomHint />}

      <SaturnRing planetPosition={icons[1].position} />

      <OrbitingMoon center={icons[0].position} radius={1.25} speed={0.45} size={0.16} color="#bfc9d1" />

      <OrbitingMoon center={icons[2].position} radius={1.1} speed={0.32} size={0.13} color="#e5e7eb" />
      <OrbitingMoon center={icons[2].position} radius={1.55} speed={-0.22} size={0.09} color="#b4b4b4" phase={Math.PI/2} />

      {icons.map((icon) => (
        <FacetedOrb
          key={icon.id}
          label={icon.label}
          position={icon.position}
          color={icon.color}
          onClick={() => handleIconClick(icon.id)}
          disabled={!!selectedPlanet}
          showLabel={!selectedPlanet}
        />
      ))}
      <CameraController selectedPlanet={selectedPlanet} setCameraDone={setCameraDone} />
    </>
  );
}

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [cameraDone, setCameraDone] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 50 }}>
        <Scene
          selectedPlanet={selectedPlanet}
          setSelectedPlanet={setSelectedPlanet}
          cameraDone={cameraDone}
          setCameraDone={setCameraDone}
        />
      </Canvas>
      {selectedPlanet && cameraDone && (
        <InfoOverlay
          planet={selectedPlanet}
          onBack={() => {
            setSelectedPlanet(null);
            setCameraDone(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
