

$(function(){
	// huuberger click function
	$('.humburger').click(function(){
		// huuberger active
	  $('.humburger').toggleClass('active');
	 	// nav open
	  $('body').toggleClass('nav-open');
	  // black layer shop when slide is active
	  $('.navigaton-slider-overlay').toggleClass('active');
	});


});


