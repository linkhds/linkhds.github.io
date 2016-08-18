$(function(){
	$(window).resize(infinite);
	function infinite() {
		var htmlWidth = $('html').width();
		if (htmlWidth >= 640) {
			$("html").css({
				"font-size" : "24px"
			});
		} else {
			$("html").css({
				"font-size" :  24 / 640 * htmlWidth + "px"
			});
		}
	}infinite();
});