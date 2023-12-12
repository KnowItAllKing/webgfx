<script id="fragment-shader" type="x-shader/x-fragment">
        #ifdef GL_ES
        precision highp float;
        #endif
        uniform vec2 canvas;
        uniform vec3 cameraPos;
        uniform vec3 sphereCenter;
        uniform float sphereRadius;
        uniform vec3 uLightPosition;
        uniform vec4 uLightColor;
        uniform mat4 uInverseViewMatrix;
        uniform mat4 uInverseProjectionMatrix;
        uniform float uReflectivity;

        struct Ray {
            vec3 origin;
            vec3 direction;
        };

        float intersectSphere(Ray ray) {
            vec3 co = ray.origin - sphereCenter;
            float discriminant = dot(co, ray.direction) * dot(co, ray.direction) - (dot(co, co) - sphereRadius * sphereRadius);

            if (discriminant >= 0.0) {
                return -dot(ray.direction, co) - sqrt(discriminant);
            } else {
                return -1.0;
            }
        }

        void main() {
            // normalized device coordinate transform
            vec2 ndc = (gl_FragCoord.xy / canvas) * 2.0 - 1.0;
            ndc.y = -ndc.y;

            // convert the screen coordinates (pixel x and y) to NDC and then 
            // transform these NDCs to world (3d) coordinates
            vec4 rayStart = uInverseProjectionMatrix * vec4(ndc, 0.0, 1.0);
            rayStart = rayStart / rayStart.w;
            rayStart = uInverseViewMatrix * rayStart;

            vec3 rayDir = normalize(rayStart.xyz - cameraPos);

            Ray ray = Ray(cameraPos, rayDir);

            float t = intersectSphere(ray);

            if (t >= 0.0) {
                vec3 hit = ray.origin + t * ray.direction;

                vec3 normal = normalize(hit - sphereCenter);
                
                vec3 lightDir = normalize(uLightPosition - hit);
                float diff = max(dot(lightDir, normal), 0.0);
                float value = uReflectivity/100.0;
                
                vec3 diffuse = diff * vec3(uLightColor[0], value, uLightColor[2]);
                //diffuse =   diff * vec3(uLightColor);
                
                
                gl_FragColor = vec4(diffuse, 1.0);
            } else {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
        }
    </script>