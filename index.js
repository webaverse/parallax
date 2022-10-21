import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useLoaders, usePhysics, useCleanup, useLocalPlayer, useCamera} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const app = useApp();
  const physics = usePhysics();
  const localPlayer = useLocalPlayer();
  const camera = useCamera();

  app.name = 'parallax';

  let layers = [];
  let startpos = [];
  let parallax = [];
  let lengths = [];

  function isNumeric(value) {
    return /^-?\d+$/.test(value);
  }

  useFrame(() => {

    if(localPlayer) {
      for (let i = 0; i < layers.length; i++) {
        const obj = layers[i];

        let temp = (localPlayer.position.x * (1 - parallax[i]));
        let dist = (localPlayer.position.x * parallax[i]);
        let length = lengths[i]/1.5;
        obj.position.x = startpos[i] + dist;
        app.updateMatrixWorld();

        if(temp > startpos[i] + length) {
          startpos[i] += length;
        }
        else if (temp < startpos[i] - length) {
          startpos[i] -= length;
        }
      }
    }

  });

  let physicsIds = [];
  (async () => {
    const u = `${baseUrl}background.glb`;
    let o = await new Promise((accept, reject) => {
      const {gltfLoader} = useLoaders();
      gltfLoader.load(u, accept, function onprogress() {}, reject);
    });
    o = o.scene;
    app.add(o);

    let count = 0;
    o.traverse(c => {
      if(c.isMesh && isNumeric(c.name)) {
        count++;
      }
    });

    app.traverse(b => {
      if(b.isMesh && isNumeric(b.name)) {
        let index = parseInt(b.name);

        layers[index] = b;
        startpos[index] = b.position.x;
        parallax[(count-1)-index] = (1 / index);

        var bbox = new THREE.Box3().setFromObject(b);
        lengths[index] = bbox.max.x;
        
        if(index === 0 || index === 1) {
          parallax[index] = 0;
        }
      }
    });
  })();

  return app;
};
