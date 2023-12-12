    <!-- <script type="x-shader/x-fragment">
        uniform vec3 cameraPos;
        uniform vec3 uLightPosition;

        struct Ray {
            vec3 origin;
            vec3 direction;
        }

        struct Sphere {
            vec3 center;
            float radius;
        }

        struct PointLight {
            vec3 position;
            vec4 color;
        }

        vec3 trace_ray() {}

        //Get the Specular color (shiny light)
        vec4 calculateSpecular(in vec3 rayd, in vec3 normal, in vec3 toLight, in PointLight light) {
            //specular exponent
            float shinnyness = 5.0;
            //get the reflected light vector
            vec3 reflected = 2.0*dot(toLight, normal)*normal - toLight;
            //calculate specular color
            return light.color * max(0.0,pow(dot(rayd,reflected),shinnyness));
        }

        //Get the Diffuse color (Basic light effect)
        vec4 calculateDiffuse(in vec3 normal, in vec3 toLight, in PointLight light) {
            return light.color * max(0.0,dot(normal,toLight));
        }
    

        // Line-sphere intersection
        float intersectSphere(in Ray ray, in Sphere) {
            vec3 co = ray.origin - sphere.center;
            float discriminant = dot(co, ray.direction) * dot(co, ray.direction) - (dot(co, co) - sphere.radius * sphere.radius);

            if (discriminant >= 0.0)
                return -dot(ray.direction, co) - sqrt(discriminant);
            else
                return -1;
        }

        vec3 calculateIntersectionPoint(in Ray ray, in float depth) {
            return ray.origin + ray.direction*depth;
        }

        //Get the sphere surface normal from the intersection point
        vec3 getSphereIntersectionNormal(in vec3 intersect, in Sphere sphere) {
            return normalize(intersect - sphere.center);
        } 

        //Get the direction to the light source (no shadows simplifies check)
        vec3 checkLight(in vec3 intersect, in PointLight light) {
            return normalize(light.position - intersect);
        }



        void main() {
            // loop through every pixel in the image
            for (int i = 1; i <= resolutionX; i++) {
                for (int j = 1; j <= resolutionY; j++) {
                    float u = i/resolutionX;
                    float v = j/resolutionY;
                    u = u * 2.0 - 1.0;
                    v = v * 2.0 - 1.0;

                    vec3 pixelPos = vec3(u, v, 0);

                    vec3 cameraPos = vec3(0.0, 0.0, -20.0);

                    vec3 rayDir = normalize(pixelPos - cameraPos);

                    Sphere sphere1 = Sphere(vec3(0.0, 0.0, 0.0), 2.);
                    Sphere sphere2 = Sphere(vec3(10, 0, 0), 2);
                    Sphere sphere3 = Sphere(vec3(-10, 0, 0), 2);
                    
                    Ray ray = Ray(cameraPos, rayDir);

                    float intersectionDepth1 = intersectSphere(ray, sphere1);
                    float intersectionDepth2 = intersectSphere(ray, sphere2);
                    float intersectionDepth3 = intersectSphere(ray, sphere3);
                    
                    if (intersectionDepth1 >= 0.5) {
                        vec4 ambientColor = vec4(0.0,0.2,0.0,0.1);

                        PointLight light = PointLight(vec3(-3.0,0.0,0.0), vec4(1.0,0.0,1.0,1.0));

                        vec3 intersect = calculateIntersectionPoint(ray, intersectionDepth);

                        vec3 normal = getSphereIntersectionNormal(intersect,sphere);

                        vec3 toLight = checkLight(intersect, light);

                        fragColor = ambientColor + calculateDiffuse(normal,toLight,light) + calculateSpecular(-ray.direction, normal, toLight, light);
                    }
                }
            }
            
        }
    </script> -->