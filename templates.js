this["JST"] = this["JST"] || {};

this["JST"]["about"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<h2>Timetable Bozen</h2>\n<table>\n	<tbody>\n		<tr>\n			<td>10:00h</td>\n			<td>Frühstück mit Kaffee</td>\n		</tr>\n		<tr>\n			<td>10:15h</td>\n			<td></td>\n		</tr>\n		<tr>\n			<td>11:30h</td>\n			<td></td>\n		</tr>\n		<tr>\n			<td>12:00h</td>\n			<td>Mapping</td>\n		</tr>\n		<tr>\n			<td>13:00h</td>\n			<td>Mittag</td>\n		</tr>\n		<tr>\n			<td>14:00h</td>\n			<td>Mapping</td>\n		</tr>\n		<tr>\n			<td>15:00h</td>\n			<td>Präsentation und Diskussion</td>\n		</tr>\n		<tr>\n			<td>17:00h</td>\n			<td>ENDE</td>\n		</tr>\n	</tbody>\n</table>\n\n\n<h2>Copyright Policy</h2> \nAll data collected will be freely available under the public domain.\n	\n<h2>Software</h2>\nThis Software is written for the neogeographic mapping party on 14th of september 2013 during the Transart festival in Bozen.\n\nThis HTML5 Web App is open source and available on the <a href=\"https://github.com/elevate-festival/neokarto-party\" title=\"GitHub Repository\">GitHub</a> repository to work on and improve it.\n\n<h2>Contact</h2>\nXXX @ YYYY";
  });

this["JST"]["noteInput"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<form>\n  <label class=\"photo icon-picture\"><input style=\"opacity:0;\" name=\"picture\" type=\"file\" accept=\"image/*;capture=camera\" capture=\"camera\"></label>\n  <br/>\n  <textarea name=\"text\" placeholder=\"What's up?\"></textarea>\n  <br/>\n  <button class=\"submit icon-ok\"></button>\n</form>\n";
  });

this["JST"]["profile"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<form>\n  <input type=\"text\" placeholder=\"your nickname\"></textarea>\n  <br/>\n  <button class=\"submit icon-ok\"></button>\n</form>\n";
  });