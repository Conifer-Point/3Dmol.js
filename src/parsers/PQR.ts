import { ParserOptionsSpec } from "./ParserOptionsSpec";
import { assignPDBBonds } from "./utils/assignPDBBonds";
import { computeSecondaryStructure } from "./utils/computeSecondaryStructure";


/**
 * Parse a pqr file from str and create atoms. A pqr file is assumed to be a whitespace delimited PDB with charge and radius fields.
 * 
 * @param {string}
 *            str
 * @param {ParserOptionsSpec}
 *            options - noSecondaryStructure (do not compute ss)
 * @category Parsers 
*/

export function PQR(str: string, options: ParserOptionsSpec) {
      var atoms: any[][] & Record<string, any> = [[]];
      var computeStruct = !options.noSecondaryStructure;
      atoms.modelData = [{symmetries:[]}];
      var serialToIndex: number[] = []; // map from pdb serial to index in atoms
      var lines = str.split(/\r?\n|\r/);
      var line: string | string[];
      for (let i = 0; i < lines.length; i++) {
          line = lines[i].replace(/^\s*/, ''); // remove indent
          var recordName = line.substring(0, 6);
          
          if (recordName.indexOf("END") == 0) {
              if (options.multimodel) {
                  if (!options.onemol)
                      atoms.push([]);
                  continue;
              }
              else {
                  break;
              }
          }
          else if (recordName == 'ATOM  ' || recordName == 'HETATM') {
              // I would have liked to split based solely on whitespace, but
              // it seems that there is no guarantee that all the fields will
              // be filled out (e.g. the chain) so this doesn't work
              var hetflag: boolean;
              let serial = parseInt(line.substring(6, 11));
              let atom = line.substring(12, 16).replace(/ /g, "");
              let resn = line.substring(17, 20).trim();
              let chain = line.substring(21, 22);
              let resi = parseInt(line.substring(22, 26));
              // however let's split the coordinates, charge and radius by
              // whitespace
              // to support extra precision
              var vals = line.substring(30).trim().split(/\s+/);
              var x = parseFloat(vals[0]);
              var y = parseFloat(vals[1]);
              var z = parseFloat(vals[2]);
              var charge = parseFloat(vals[3]);
              var radius = parseFloat(vals[4]);

              var elem = atom[0];
              if (atom.length > 1 && atom[1].toUpperCase() != atom[1]) {
                  // slight hack - identify two character elements by the
                  // second character in the atom name being lowercase
                  elem = atom.substring(0, 2);
              }

              if (line[0] == 'H')
                  hetflag = true;
              else
                  hetflag = false;
              serialToIndex[serial] = atoms[atoms.length-1].length;
              atoms[atoms.length-1].push({
                  'resn' : resn,
                  'x' : x,
                  'y' : y,
                  'z' : z,
                  'elem' : elem,
                  'hetflag' : hetflag,
                  'chain' : chain,
                  'resi' : resi,
                  'serial' : serial,
                  'atom' : atom,
                  'bonds' : [],
                  'ss' : 'c',
                  'bondOrder' : [],
                  'properties' : {
                      'charge' : charge,
                      'partialCharge' : charge,
                      'radius' : radius
                  },
                  'pdbline' : line
              });
          } else if (recordName == 'CONECT') {
              // MEMO: We don't have to parse SSBOND, LINK because both are
              // also
              // described in CONECT. But what about 2JYT???
              var from = parseInt(line.substring(6, 11));
              var fromAtom = atoms[atoms.length-1][serialToIndex[from]];
              for (let j = 0; j < 4; j++) {
                  var to = parseInt(line.substring([ 11, 16, 21, 26 ][j], [ 11, 16, 21, 26 ][j] + 5));
                  var toAtom = atoms[atoms.length-1][serialToIndex[to]];
                  if (fromAtom !== undefined && toAtom !== undefined) {
                      fromAtom.bonds.push(serialToIndex[to]);
                      fromAtom.bondOrder.push(1);
                  }
              }
          }
      }

      // assign bonds - yuck, can't count on connect records
      for (let i = 0; i < atoms.length; i++) {
          assignPDBBonds(atoms[i],options);
          if (computeStruct)
              computeSecondaryStructure(atoms[i],options.hbondCutoff);
      }
      
      return atoms;
  };