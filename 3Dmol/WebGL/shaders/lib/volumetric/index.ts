import { uniforms } from "./uniforms";
import { Shader } from "../../shaders";
import fragmentShader from "./volumetric.frag";
import vertexShader from "./volumetric.vert";
//import fs from "fs";
//
//const fragmentShader = fs.readFileSync(__dirname + "/volumetric.frag", "utf8");
//const vertexShader = fs.readFileSync(__dirname + "/volumetric.vert", "utf8");

export const volumetric: Shader = {
    fragmentShader,
    vertexShader,
    uniforms
}