this["JST"] = this["JST"] || {};

this["JST"]["about"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h2>Timetable Bozen</h2>\n<table>\n	<tbody>\n		<tr>\n			<td>10:00h</td>\n			<td>Frühstück mit Kaffee</td>\n		</tr>\n		<tr>\n			<td>10:15h</td>\n			<td></td>\n		</tr>\n		<tr>\n			<td>11:30h</td>\n			<td></td>\n		</tr>\n		<tr>\n			<td>12:00h</td>\n			<td>Mapping</td>\n		</tr>\n		<tr>\n			<td>13:00h</td>\n			<td>Mittag</td>\n		</tr>\n		<tr>\n			<td>14:00h</td>\n			<td>Mapping</td>\n		</tr>\n		<tr>\n			<td>15:00h</td>\n			<td>Präsentation und Diskussion</td>\n		</tr>\n		<tr>\n			<td>17:00h</td>\n			<td>ENDE</td>\n		</tr>\n	</tbody>\n</table>\n\n\n<h2>Copyright Policy</h2> \nAll data collected will be freely available under the public domain.\n	\n<h2>Software</h2>\nThis Software is written for the neogeographic mapping party on 14th of september 2013 during the Transart festival in Bozen.\n\nThis HTML5 Web App is open source and available on the <a href=\"https://github.com/elevate-festival/neokarto-party\" title=\"GitHub Repository\">GitHub</a> repository to work on and improve it.\n\n<h2>Contact</h2>\nXXX @ YYYY\n";
  });

this["JST"]["controls"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<!-- FIXME <label><input class=\"follow-me\" type=\"checkbox\">Follow Me</label> -->\n<button class=\"about icon-info\"></button>\n<button class=\"note icon-comment\"></button>\n<button class=\"settings icon-profile\"></button>\n";
  });

this["JST"]["note"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<form>\n  <label class=\"photo icon-camera\"><input style=\"display:none;\" name=\"media\" type=\"file\" accept=\"image/*;capture=camera\" capture=\"camera\"></label>\n  <br/>\n  <textarea name=\"text\" placeholder=\"What's up?\"></textarea>\n</form>\n";
  });

this["JST"]["profile"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n  	<img class=\"avatar\" src=\"assets/images/avatars/"
    + escapeExpression(((stack1 = depth0.file),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + ".png\" alt=\""
    + escapeExpression(((stack1 = depth0.name),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" title=\""
    + escapeExpression(((stack1 = depth0.name),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data=\""
    + escapeExpression(((stack1 = depth0.file),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\"></img>\n  ";
  return buffer;
  }

  buffer += "<form>\n  <input type=\"text\" placeholder=\"your nickname\" value=\"";
  if (stack1 = helpers.nickname) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.nickname; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></textarea>\n  <br/>\n  ";
  stack1 = helpers.each.call(depth0, depth0.avatars, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</form>\n";
  return buffer;
  });