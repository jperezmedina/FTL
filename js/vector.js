/**
 *
 * The !FTL, an Articulation-Invariant Stroke Gesture Recognizer with Controllable Position, 
 * Scale, and Rotation Invariances (JavaScript version)
 *
 *  Jean Vanderdonckt
 *  Université catholique de Louvain, UCL
 *  Louvain-la-neuve, Belgium
 *  jean.vanderdonckt@uclouvain.be
 *
 *  Paolo Roselli
 *  Université catholique de Louvain, UCL
 *  Louvain-la-neuve, Belgium
 *  paolo.roselli@uclouvain.be
 *
 *  Jorge-Luis Pérez-Medina
 *  Universidad de Las Américas, UDLA
 *  Quito, Ecuador
 *  jorge.perez.medina@udla.edu.ec 
 *
 * Please cite these papers in your publications if it helps your research:
 *
 * @inproceedings{10.1145/3242969.3243032,
 *    author = {Vanderdonckt, Jean and Roselli, Paolo and P\'{e}rez-Medina, Jorge Luis},
 *    title = {!!FTL, an Articulation-Invariant Stroke Gesture Recognizer with Controllable
 *    Position, Scale, and Rotation Invariances},
 *    year = {2018},
 *    isbn = {9781450356923},
 *    publisher = {Association for Computing Machinery},
 *    address = {New York, NY, USA},
 *    url = {https://doi.org/10.1145/3242969.3243032},
 *    doi = {10.1145/3242969.3243032},
 *    booktitle = {Proceedings of the 20th ACM International Conference on Multimodal
 *     Interaction},
 *    pages = {125–134},
 *    numpages = {10},
 *    keywords = {isoparameterization, local shape distance, articulation invariance, 
 *    isochronicity, isometricity, stroke gesture recognition},
 *    location = {Boulder, CO, USA},
 *    series = {ICMI ’18}
 * }
 *
 * This software is distributed under the License (GNU GENERAL PUBLIC LICENSE) 
 *
 * Copyright (C) 2018, Jean Vanderdonckt, Paolo Roselli, and
 * Jorge-Luis Pérez-Medina. All rights reserved. Last updated October 16, 2018.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program comes with ABSOLUTELY NO WARRANTY; for details type `show w'.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions; type `show c' for details.
 *
 * The hypothetical commands `show w' and `show c' should show the appropriate
 * parts of the General Public License.  Of course, your program's commands
 * might be different; for a GUI interface, you would use an "about box".
 *
 * You should also get your employer (if you work as a programmer) or school,
 * if any, to sign a "copyright disclaimer" for the program, if necessary.
 * For more information on this, and how to apply and follow the GNU GPL, see
 * <https://www.gnu.org/licenses/>.
 *
 * The GNU General Public License does not permit incorporating your program
 * into proprietary programs.  If your program is a subroutine library, you
 * may consider it more useful to permit linking proprietary applications with
 * the library. If this is what you want to do, use the GNU Lesser General
 * Public License instead of this License.  But first, please read
 * <https://www.gnu.org/licenses/why-not-lgpl.html>.
 *
**/


function VectorSimulation(P, i, j) // VectorSimulation class constructor
{
    this.P = P;
    this.i = i;
    this.j = j
}

function Point(x, y) // Point class constructor
{
    this.X = x;
    this.Y = y;
}

function Point(x, y, id) // Point class constructor
{
    this.X = x;
    this.Y = y;
    this.ID = id; // stroke ID to which this point belongs (1,2,...)

}

function RP(name, points, format, threshold) // Reference_Gesture_Vector structure
{
    this.Name = name
    this.Points = points;
    this.Format = format;
    this.Threshold = threshold;
}

function ResultFTL(name, score, time, data, nroOfPoints, image) // constructor
{
    this.Name = name;
    this.Score = score;
    this.Time = time;
    this.Data = data;
    this.NumberOfPoints = nroOfPoints;
    this.Image = image;
}

var ms; // VectorAlgorithm class constants
var P = 32;

function VectorAlgorithm() // VectorAlgorithm class
{
    this.RPs = new Array(); // Reference_Gesture_Vector ISO-crone
    this.ComparedGestures = new Array(); // Vector with all compared gestures
    this.Vectors = new Array(); // Array of vector for the simulation
    
    this.CompareGesture = function (SP_, NumberOfPoints, Threshold, Format, SensitiveOrientation, method) {
        var t0 = performance.now();
        var SP  = []; 
        var Or = (SensitiveOrientation === "on") ? 1 : 0;
        var L = SP_.length;        
        P = NumberOfPoints;
        if (L == P) {
            SP = SP_;
        } else {
            SP = Interpolate_Gesture(SP_);
            L = SP.length;
        }
        var g, k, h, i, d, j;
        var pos = -1;        
        var LA = this.RPs.length - 1;
        this.Vectors.length = 0;
        g = 0;
        for (; g <= LA; g++) {
            var RP  = []; 
            var RPg = this.RPs[g];
            k = 0;
            L = RPg.Points.length;
            if (L == P) {
                RP = RPg.Points;
            } else {
                RP = Interpolate_Gesture(RPg.Points);
                L = RP.length;
            }
            d = 0;
            var lSd;
            var d_plus = 0;
            var d_less = 0;
            var L_less2 = L - 2;
            i = 1;
            for(; i <= L_less2; i++) {
                if (method=="LSD") {
                    lSd = Local_Shape_Distance(
                            new Point( (SP[i].X - SP[i - 1].X), (SP[i].Y - SP[i - 1].Y) ), 
                            new Point( (SP[i + 1].X - SP[i].X), (SP[i + 1].Y - SP[i].Y) ),
                            new Point( (RP[i].X - RP[i - 1].X), (RP[i].Y - RP[i - 1].Y) ),
                            new Point( (RP[i + 1].X - RP[i].X), (RP[i + 1].Y - RP[i].Y) )        
                            );
                } 
                else {
                    lSd = Normalized_Local_Shape_Distance(
                            new Point( (SP[i].X - SP[i - 1].X), (SP[i].Y - SP[i - 1].Y) ), 
                            new Point( (SP[i + 1].X - SP[i].X), (SP[i + 1].Y - SP[i].Y) ),
                            new Point( (RP[i].X - RP[i - 1].X), (RP[i].Y - RP[i - 1].Y) ),
                            new Point( (RP[i + 1].X - RP[i].X), (RP[i + 1].Y - RP[i].Y) ) 
                            ); 
                }                
                d_plus = d_plus + lSd;
                if (d_plus > Threshold) { break }      
            }
            i = 1;
            if (Or != 1) {
                for(; i <= L_less2; i++) {
                    if (method=="LSD") {
                       lSd = Local_Shape_Distance(
                            new Point( (SP[i].X - SP[i - 1].X), (SP[i].Y - SP[i - 1].Y) ), 
                            new Point( (SP[i + 1].X - SP[i].X), (SP[i + 1].Y - SP[i].Y) ),      
                            new Point( (RP[L - (i + 1)].X - RP[L - i]. X), (RP[L - (i + 1)].Y - RP[L - i].Y) ),
                            new Point( (RP[L - (i + 2)].X - RP[L - (i + 1)].X), (RP[L - (i + 2)].Y - RP[L - (i + 1)].Y) ) 
                            ); 
                    } 
                    else {
                        lSd = Normalized_Local_Shape_Distance(
                            new Point( (SP[i].X - SP[i - 1].X), (SP[i].Y - SP[i - 1].Y) ), 
                            new Point( (SP[i + 1].X - SP[i].X), (SP[i + 1].Y - SP[i].Y) ),      
                            new Point( (RP[L - (i + 1)].X - RP[L - i]. X), (RP[L - (i + 1)].Y - RP[L - i].Y) ),
                            new Point( (RP[L - (i + 2)].X - RP[L - (i + 1)].X), (RP[L - (i + 2)].Y - RP[L - (i + 1)].Y) ) 
                            );
                    }
                    d_less = d_less + lSd;
                    if (d_less > Threshold) { break }    
                }
            }
            (Or != 1) ? d = Math.min(d_plus, d_less): d = d_plus;
            if (d <= Threshold) {
                Threshold = d;
                pos = g;
            }
        }
        if (method == "NLSD") {d = d/100};
        var t1 = performance.now();
        return (pos == -1) ? new ResultFTL("No match.", 0.0, (t1-t0), [], P, '-') : new ResultFTL(
            this.RPs[pos].Name, Threshold, (t1-t0), this.RPs[pos].RP, P, '-');
    }
    
    this.SaveAs = function (SSP, nroOfPoints, name, Format, threshold) {
        P = nroOfPoints;
        var s = new RP(name, Interpolate_Gesture(SSP), Format, threshold);
        this.RPs[this.RPs.length] = s;
    }
    
    this.getLenghtRPs = function () {
        return this.RPs.length;
    }
    
    this.getRPs = function () {
        return this.RPs;
    }
    
    this.setRPs = function (data, option) {
        if (option == 0) {
            this.RPs = [];
        }
        var i = 0;
        for (; i < data.length; i++) {
            this.RPs[this.RPs.length] = new RP(data[i].Name, data[i].Points, data[i].Format, data[i].Threshold);
        }
    }
    
    this.getLenghtComparedGestures - function () {
        return this.ComparedGestures.length;
    }
    
    this.getComparedGestures = function () {
        return this.ComparedGestures;
    }
    
    this.SaveComparedGesture = function (gesture, nroOfPoints, name, Format, Threshold) {
        P = nroOfPoints;    
        var s = new RP(name, gesture, Format, Threshold);
        this.ComparedGestures[this.ComparedGestures.length] = s;
    }  
}

function Interpolate_Gesture(g) {
    var newG  = []; 
    var j = 0;
    var L = g.length; 
    var P_less1 = P - 1;
    for (; j <= P_less1 ; j++) {
        var factor1 = (P - (j + 1)) / P_less1;
        var factor2 = j/P_less1;
        var factorForJ = [(L - 1)*j] / P_less1;
        newG[j] = new Point(factor1 *  g[Math.floor(factorForJ)].X + factor2 * g[Math.ceil(factorForJ)].X,
            factor1 *  g[Math.floor(factorForJ)].Y + factor2 * g[Math.ceil(factorForJ)].Y, g[Math.floor(factorForJ)].ID);
    }
    return newG;
}

function Scalar_Product(a, u) {
    return (a.X * u.X) + (a.Y * u.Y);
}

function Local_Shape_Distance(a, b, u, v) {
    var alpha = Scalar_Product(a, a);
    var beta = Scalar_Product(b, b);
    var gamma = Scalar_Product(u, u);
    var delta = Scalar_Product(v, v);
    var val=0;
    if ( (beta * delta) != 0 ) {
        numerator = alpha * delta + beta * gamma - 2 * (
            Scalar_Product(a, b) * Scalar_Product(u, v) - Scalar_Product(a, v) * Scalar_Product(b, u) + Scalar_Product(a, u) * Scalar_Product(b, v) ); 
        val = Math.sqrt(numerator / (beta * delta));
    }        
    return val;
}

function Normalized_Local_Shape_Distance(a, b, u, v) {
    var alpha = Scalar_Product(a, a);
    var beta = Scalar_Product(b, b);
    var gamma = Scalar_Product(u, u);
    var delta = Scalar_Product(v, v);
    var val=0;
    if ( (alpha * beta * gamma * delta) != 0 ) {        
        val = Math.sqrt( Math.max(0, (1 - (( Scalar_Product(a, b) * Scalar_Product(u, v) + Scalar_Product(a, u) * Scalar_Product(b, v) - Scalar_Product(a, v) * Scalar_Product(b, u) ) / (Math.sqrt(alpha) * Math.sqrt(beta) * Math.sqrt(gamma) * Math.sqrt(delta)) ) ) ) )
    }    
    return val;
}
