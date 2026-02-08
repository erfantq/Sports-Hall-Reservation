import LightRays from './LightRays';

function MyLightRays() {
  return (

    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={0.5}
        rayLength={3}
        followMouse={true}
        fadeDistance={0.8}
        mouseInfluence={0.2}
        noiseAmount={0}
        distortion={0}
        className="custom-rays"
    />
    </div>
  );
}

export default MyLightRays;