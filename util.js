


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



const createQuad = (bottom_left, top_right) => {
    let depth = bottom_left[2]; // we will set Z of all points equal

    let x1 = bottom_left[0];
    let y1 = bottom_left[1];
    let x2 = top_right[0];
    let y2 = top_right[1];

    const vertices = [
        [x1, y2, depth],   // bottom left
        [x2, y2, depth],    // bottom right
        [x2, y1, depth],    // top right 
        [x1, y1, depth]    // top left
    ];

    const indices = [
        0, 1, 2, 
        2, 3, 0
    ];

    return {
        vertices: new Float32Array(vertices),
        indices
    }; 
}