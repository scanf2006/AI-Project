import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];

        // Geometry for a single particle
        this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    }

    emit(position, count = 10, color = 0xffff00) {
        const material = new THREE.MeshBasicMaterial({ color: color });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(this.geometry, material);
            mesh.position.copy(position);

            // Random velocity
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );

            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life: 1.0 });
        }
    }

    update(delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.life -= delta * 2; // Fade out speed

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
                continue;
            }

            // Physics
            p.velocity.y -= 20 * delta; // Gravity
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.mesh.rotation.x += p.velocity.z * delta;
            p.mesh.rotation.y += p.velocity.x * delta;

            // Fade scale
            p.mesh.scale.setScalar(p.life);
        }
    }
}
