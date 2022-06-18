import { Shader } from '../../shaders';
import { uniforms } from './uniforms';
import fragmentShader from './lambert.frag';
import vertexShader from './lambert.vert';
//import fs from 'fs';
//
//const fragmentShader = fs.readFileSync(__dirname + '/lambert.frag', 'utf8');
//const vertexShader = fs.readFileSync(__dirname + '/lambert.vert', 'utf8');

export const lambert: Shader = {
    fragmentShader,
    vertexShader,
    uniforms,
}