const generateIndicesForSphere = (latitudeLines, longitudeLines) => {
    const indices = [];

    for (let lat = 0; lat < latitudeLines; lat++) {
        for (let long = 0; long < longitudeLines; long++) {
            let first = (lat * (longitudeLines + 1)) + long;
            let second = first + longitudeLines + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return indices;
};


const generateSphereVertices = (radius, lat, long) => {
    const vertices = [];
    
    for (let i = 0; i <= lat; i++) {
        const theta = i * Math.PI / lat;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let j = 0; j <= long; j++) {
            const phi = j * 2 * Math.PI / long;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            vertices.push(radius * cosPhi * sinTheta);
            vertices.push(radius * cosTheta);
            vertices.push(radius * sinPhi * sinTheta);
        }
    }
    return new Float32Array(vertices);
};