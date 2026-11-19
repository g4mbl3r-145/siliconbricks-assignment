import { Line, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { centroid, type Poly } from '../lib/geometry'

interface Props {
  plot: Poly
  buildable: Poly
  footprint: Poly
  floors: number
  floorHeight: number
  level: number | null
  sun: [number, number, number]
}

const shape = (p: Poly, [cx, cy]: [number, number]) =>
  new THREE.Shape(p.map(([x, y]) => new THREE.Vector2(x - cx, y - cy)))

const ring = (p: Poly, [cx, cy]: [number, number], y: number) =>
  [...p, p[0]].map(([x, z]) => [x - cx, y, -(z - cy)] as [number, number, number])

export default function Viewer({ plot, buildable, footprint, floors, floorHeight, level, sun }: Props) {
  const c = useMemo(() => centroid(plot), [plot])
  const span = useMemo(() => Math.max(...plot.flatMap(([x, y]) => [Math.abs(x - c[0]), Math.abs(y - c[1])])) * 2, [plot, c])
  const floorGeo = useMemo(
    () => (footprint.length > 2 ? new THREE.ExtrudeGeometry(shape(footprint, c), { depth: floorHeight * 0.96, bevelEnabled: false }) : null),
    [footprint, floorHeight, c],
  )
  const up = sun[1] > 0
  const d = span * 1.5 + floors * floorHeight

  return (
    <Canvas shadows="percentage" camera={{ position: [span, span * 0.9 + floors * floorHeight, span * 1.2], fov: 45 }}>
      <color attach="background" args={['#e9eef3']} />
      <hemisphereLight args={['#ffffff', '#b8c2cc', up ? 0.6 : 0.25]} />
      {up && (
        <directionalLight
          castShadow
          position={sun.map(v => v * d) as [number, number, number]}
          intensity={2.2}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-d}
          shadow-camera-right={d}
          shadow-camera-top={d}
          shadow-camera-bottom={-d}
          shadow-camera-far={d * 3}
        />
      )}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position-y={-0.02}>
        <planeGeometry args={[span * 6, span * 6]} />
        <meshStandardMaterial color="#d7dde3" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <shapeGeometry args={[shape(plot, c)]} />
        <meshStandardMaterial color="#c9d8b6" />
      </mesh>
      <Line points={ring(plot, c, 0.03)} color="#3b4a3a" lineWidth={2} />
      {buildable.length > 2 && <Line points={ring(buildable, c, 0.04)} color="#b45309" lineWidth={1.5} dashed dashSize={1} gapSize={0.6} />}
      {floorGeo &&
        Array.from({ length: floors }, (_, i) => {
          const sel = level === i
          const above = level !== null && i > level
          return (
            <mesh key={i} geometry={floorGeo} rotation-x={-Math.PI / 2} position-y={i * floorHeight} castShadow receiveShadow>
              <meshStandardMaterial
                color={sel ? '#2563eb' : '#f4f1ea'}
                transparent={above}
                opacity={above ? 0.12 : 1}
                depthWrite={!above}
              />
            </mesh>
          )
        })}
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} target={[0, (floors * floorHeight) / 3, 0]} />
    </Canvas>
  )
}
