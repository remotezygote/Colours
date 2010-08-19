/* A class to parse color values - based lossely on work by Stoyan Stefanov <sstoo@gmail.com> */
var Colorspace = {
	Color: function(color) {
		this.ok = false;
		this.isColor = true;
		if(!color) color = "#000";
		this.fromHSV = function(hsv) {
			var i, f, p, q, t;
			hsv.h%=360;
			if(hsv.v==0) {
				this.r = this.g = this.b = 0;
				return(this);
			};
			hsv.s/=100;
			hsv.v/=100;
			hsv.h/=60;
			i = Math.floor(hsv.h);
			f = hsv.h-i;
			p = hsv.v*(1-hsv.s);
			q = hsv.v*(1-(hsv.s*f));
			t = hsv.v*(1-(hsv.s*(1-f)));
			if (i==0) {this.r=hsv.v; this.g=t; this.b=p;}
			else if (i==1) {this.r=q; this.g=hsv.v; this.b=p;}
			else if (i==2) {this.r=p; this.g=hsv.v; this.b=t;}
			else if (i==3) {this.r=p; this.g=q; this.b=hsv.v;}
			else if (i==4) {this.r=t; this.g=p; this.b=hsv.v;}
			else if (i==5) {this.r=hsv.v; this.g=p; this.b=q;}
			this.r = Math.floor(this.r*255);
			this.g = Math.floor(this.g*255);
			this.b = Math.floor(this.b*255);
			return(this);
		};
		if(typeof color=="string") {
			if (color.charAt(0) == '#') {
				color = color.substr(1,6);
			};
			color = color.replace(/ /g,'');
			color = color.toLowerCase();
			var patterns = [
				{
					matcher: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
					process: function (bits){
						return [
							parseInt(bits[1],10),
							parseInt(bits[2],10),
							parseInt(bits[3],10),
							parseInt(bits[4],10)
						];
					}
				},
				{
					matcher: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
					process: function (bits){
						return [
							parseInt(bits[1],10),
							parseInt(bits[2],10),
							parseInt(bits[3],10)
						];
					}
				},
				{
					matcher: /^(\w{2})(\w{2})(\w{2})$/,
					process: function (bits){
						return [
							parseInt(bits[1],16),
							parseInt(bits[2],16),
							parseInt(bits[3],16)
						];
					}
				},
				{
					matcher: /^(\w{1})(\w{1})(\w{1})$/,
					process: function(bits){
						return [
							parseInt(bits[1]+bits[1],16),
							parseInt(bits[2]+bits[2],16),
							parseInt(bits[3]+bits[3],16)
						];
					}
				}
			];
			for(var i=0;i<patterns.length;i++) {
				var bits = patterns[i].matcher.exec(color);
				if (bits) {
					channels = patterns[i].process(bits);
					this.r = channels[0];
					this.g = channels[1];
					this.b = channels[2];
					this.alpha = channels.length > 3 ? channels[3] : 1;
					this.ok = true;
				};
			};
			this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
			this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
			this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
			this.alpha = (this.alpha < 0 || isNaN(this.alpha)) ? 1 : ((this.alpha > 1) ? 1 : this.alpha);
		} else if(typeof color=="object"&&color.length) {
			this.r = (color[0] < 0 || isNaN(color[0])) ? 0 : ((color[0] > 255) ? 255 : color[0]);
			this.g = (color[1] < 0 || isNaN(color[1])) ? 0 : ((color[1] > 255) ? 255 : color[1]);
			this.b = (color[2] < 0 || isNaN(color[2])) ? 0 : ((color[2] > 255) ? 255 : color[2]);
			this.alpha = (!color[3] || color[3] < 0 || isNaN(color[3])) ? 1 : ((color[3] > 1) ? 1 : color[3]);
			this.ok = true;
		} else if(typeof color=="object") {
			if(color.h!=undefined && color.s!=undefined && (color.v!=undefined || color.b!=undefined)) {
				if(color.b) color.v = color.b;
				this.fromHSV(color);
			} else if(color.c && color.m && color.y && color.k) {
				
			};
		} else {};
		this.toRGB = function() {
			return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
		};
		this.toRGBa = function() {
			return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.alpha + ')';
		};
		this.brightness = function() {
			return(Math.sqrt(this.r*this.r*.241+this.g*this.g*.691+this.b*this.b*.068));
		};
		this.toHSV = function() {
			var x, val, f, i, hue, sat, val;
			hue = 0;
			var r = this.r, g = this.g, b = this.b;
			r/=255;
			g/=255;
			b/=255;
			x = Math.min(Math.min(r, g), b);
			val = Math.max(Math.max(r, g), b);
			if (x==val) return({h:0, s:0, v:val*100});
			f = (r == x) ? g-b : ((g == x) ? b-r : r-g);
			i = (r == x) ? 3 : ((g == x) ? 5 : 1);
			hue = Math.floor((i-f/(val-x))*60)%360;
			sat = Math.floor(((val-x)/val)*100);
			val = Math.floor(val*100);
			return({h:hue, s:sat, v:val});
		};
		this.lightness = function() {return(this.brightness());};
		this.toHex = function() {
			var r = this.r.toString(16).replace(/\..*/,'');
			var g = this.g.toString(16).replace(/\..*/,'');
			var b = this.b.toString(16).replace(/\..*/,'');
			if (r.length == 1) r = '0' + r;
			if (g.length == 1) g = '0' + g;
			if (b.length == 1) b = '0' + b;
			return '#' + r + g + b;
		};
	},
	Gradient: function(start,end,points) {
		this.start = start.isColor ? start : new Colorspace.Color(start);
		this.end = end.isColor ? end : new Colorspace.Color(end);
		this.atPercent = function(pct) {
			return(new Colorspace.Color([this.start.r>this.end.r?this.start.r-((this.start.r-this.end.r)*(pct/100)):this.start.r+((this.end.r-this.start.r)*(pct/100)),this.start.g>this.end.g?this.start.g-((this.start.g-this.end.g)*(pct/100)):this.start.g+((this.end.g-this.start.g)*(pct/100)),this.start.b>this.end.b?this.start.b-((this.start.b-this.end.b)*(pct/100)):this.start.b+((this.end.b-this.start.b)*(pct/100))]));
		};
	}
};