
(function () {
	"use strict";
	
	var deltaDecorations = function (oldDecorations, newDecorations) {
		/// <summary>
		///   Update oldDecorations to match newDecorations.
		///   It will remove old decorations which are not found in new decorations
		///   and add only the really new decorations.
		/// </summary>
		/// <param name="oldDecorations" type="Array">
		///   An array containing ids of existing decorations
		/// </param>
		/// <param name="newDecorations" type="Array">
		///   An array containing literal objects describing new decorations. A
		///   literal contains the following two fields:
		///      range
		///      options
		/// </param>
		/// <returns type="Array">
		///   Returns an array of decorations ids
		/// </returns>
		var hashFunc = function (range, options) {
			return range.startLineNumber + "," + range.startColumn + "-" + range.endLineNumber + "," + range.endColumn +
				"-" + options.hoverMessage + "-" + options.className + "-" + options.isOverlay + "-" + options.showInOverviewRuler;
		};
		return this.changeDecorations(function (changeAccessor) {
			var i, len, oldDecorationsMap = {}, hash;
			
			// Record old decorations in a map
			// Two decorations can have the same hash
			for (i = 0, len = oldDecorations.length; i < len; i++) {
				hash = hashFunc(this.getDecorationRange(oldDecorations[i]), this.getDecorationOptions(oldDecorations[i]));
				oldDecorationsMap[hash] = oldDecorationsMap[hash] || [];
				oldDecorationsMap[hash].push(oldDecorations[i]);
			}
			
			// Add only new decorations & mark reused ones
			var j, lenJ, result = [], usedOldDecorations = {}, oldDecorationsCandidates, reusedOldDecoration;
			for (i = 0, len = newDecorations.length; i < len; i++) {
				hash = hashFunc(newDecorations[i].range, newDecorations[i].options);
				reusedOldDecoration = false;
				if (oldDecorationsMap.hasOwnProperty(hash)) {
					oldDecorationsCandidates = oldDecorationsMap[hash];
					// We can try reusing an old decoration (if it hasn't been reused before)
					for (j = 0, lenJ = oldDecorationsCandidates.length; j < lenJ; j++) {
						if (!usedOldDecorations.hasOwnProperty(oldDecorationsCandidates[j])) {
							// Found an old decoration which can be reused & it hasn't been reused before
							reusedOldDecoration = true;
							usedOldDecorations[oldDecorationsCandidates[j]] = true;
							result.push(oldDecorationsCandidates[j]);
							break;
						}
					}
				}
				
				if (!reusedOldDecoration) {
					result.push(changeAccessor.addDecoration(newDecorations[i].range, newDecorations[i].options));
				}
			}
			
			// Remove unused old decorations
			for (i = 0, len = oldDecorations.length; i < len; i++) {
				if (!usedOldDecorations.hasOwnProperty(oldDecorations[i])) {
					changeAccessor.removeDecoration(oldDecorations[i]);
				}
			}
			
			return result;
		}.bind(this));
	};

})();
