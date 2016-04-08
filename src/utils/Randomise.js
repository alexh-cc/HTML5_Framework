/**
 * Utility class for randomisation
 */
alex.utils.Randomise = {
	HOLDER: [],
	/**
     * randomises the content of an Array
     * @param p_list
     */
	randomise: function (p_list) {
		this.HOLDER.length = 0;
		//copy items into holder array
		var i, l_nItems = p_list.length;
		for (i = 0; i < l_nItems; i++) this.HOLDER[i] = p_list[i];
		//empty the source array;
		p_list.length = 0;
		//re-populate the source array
		while (this.HOLDER.length > 0) {
			var index = this.randomInt(this.HOLDER.length - 1);
			p_list[p_list.length] = this.HOLDER.splice(index, 1)[0];
		}
	},

    /**
     * this version makes randomised copy of the list it receives,
     * and returns the copy, leaving the source list unchanged
     * @param p_list
     * @returns {Array}
     */
	randomisedCopy: function (p_list) {
		var randomised = [], list = p_list.slice();
		while (list.length > 0) {
			var index = this.randomInt(list.length - 1);
			randomised[randomised.length] = list.splice(index, 1)[0];
		}
		return randomised;
	},

	/**
     * returns a random float
     * @param range
     * @returns {number}
     */
	randomNumber: function (range) {
		return Math.random() * range;
	},

    /**
     * returns a random float within a given range
     * @param p_min
     * @param p_max
     * @returns {*}
     */
	randomInRange: function (p_min, p_max) {
		var dif = p_max - p_min;
		return p_min + (Math.random() * dif);
	},

    /**
     * returns a rounded integer from zero up to and including range
     * @param range
     * @returns {number}
     */
	randomInt: function (range) {
		return Math.floor(Math.random() * (range + 1));
	}
};