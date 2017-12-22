var RCB = RCB || {};
  RCB.bundles = RCB.bundles || [];
  RCB.base = RCB.base || {};
  RCB.bundle = RCB.bundle || {};

RCB.bundle = (function(RCB, $) {

	var bundleProductId = 0;
  
  	// check if a bundle is active
    function isBundle() {
      return bundleProductId !== 0 ? true : false;
    }
  
  	// get current bundle id
    function getBundle() {
		return bundleProductId;
    }
  	
	// turn on and off a bundle
	function toggleBundle(context, id, variantId, baseVariantId) {
		
		if(!$(context).hasClass('active')) {
          	$('.bundle-activate-btn').removeClass('active');
			$(context).addClass('active');
			
          if(!bundleProductId) { // bundle has not been selected
            var baseId = $('#id').val();
			$('#id').attr('base-id', baseId); // set the base variant id
          }
          else {
            //console.log(baseVariantId);
			$('#id').attr('base-id', baseVariantId); // update the base to reflect new bundle
          }
          
          $('#id').val(variantId); // update the variant id
          
          bundleProductId = id;
		}
		else {
			$(context).removeClass('active');
          	
			var baseId = $('#id').attr('base-id'); // get the base variant id
			$('#id').attr('base-id', '');
			$('#id').val(baseId); // update the variant id
          
          	bundleProductId = 0;
		}

	}
	
	// get a bundle variant by bundle id and base variant title
	function getBundleVariant(bundleId, baseTitle) {

    console.log(bundleId, baseTitle);

    /*console.timer('This is a system console timer');

    console.timerEnd('This is a system console timer');*/
		
		var variant = {};
		if(RCB.bundles.length && bundleId) {

			for(var i = 0; i < RCB.bundles.length; i++) {
				var bundle = RCB.bundles[i];
				
				if(bundle.id == bundleId) {

          console.log((bundle.id == bundleId));
					
					for(var j= 0; j < bundle.variants.length; j++) {

            console.log(bundle.variants[j]);

						if(bundle.variants[j].title == baseTitle) variant = bundle.variants[j];

            console.log((bundle.variants[j].title == baseTitle));
					}

				}

			}

		}

		return variant;
	}
  
  
  	// update all bundles, based on a selected variant
    function updateBundleUI(baseTitle) {
      
      for(var i = 0; i < RCB.bundles.length; i++) {
        
        var bundleContainer = $('[data-bundle-product-id="' + RCB.bundles[i].id + '"]');
        
        var variant = getBundleVariant(RCB.bundles[i].id, baseTitle);
        
        if(!variant.id) continue;
        
        var variantContainer = bundleContainer.find('.bundle-variants [data-bundle-variant-id="' + variant.id + '"]');
      
        var savings = variantContainer.attr('data-savings');
        var additional_price = variantContainer.attr('data-additional-price');
        var image = variantContainer.attr('data-image');

        bundleContainer.find('.savings').text(savings);
        bundleContainer.find('.additional-price').text('$' + additional_price);
        bundleContainer.find('.bundle-image').attr('src', image);
        
      }
      
    }


	return {
      isBundle: isBundle,
      getBundle: getBundle,
      toggleBundle: toggleBundle,
      getBundleVariant: getBundleVariant,
      updateBundleUI: updateBundleUI
	};
	
})(RCB, jQuery);



RCB.base = (function(RCB, $) {
	
	// get a variant by id
	function getVariant(id) {
		var variantSelector = $('.product-details__variants img[data-id="' + id + '"]');

		var id    = variantSelector.attr('data-id'),
			title = variantSelector.attr('data-variant-name'),
			price = variantSelector.attr('data-variant-price'),
			sku   = variantSelector.attr('data-sku');

		var variant = {
			id: id,
			title: title,
			price: price,
			sku: sku,
		};

		return variant;
	}


	// get the currently selected base variant
	function getSelectedVariant(){
		// current variant
		var currentVariantId = $('.product-details__variants img.selected').attr('data-id');
		
		var variant = getVariant(currentVariantId);

		return variant;
	}

	// set the selected variant, base or bundle
	function setSelectedVariant(variant, isBundle) {
      
      	// update the elements
		$('#price').text(variant.price); // update the price
		$('.product-details__finish').text(variant.title); // update the title
		$('.sku').text(variant.sku); // update the sku

		// update bundle selection UI
      	RCB.bundle.updateBundleUI(variant.title);
      
      	// check if bundle
        if(isBundle) {
			var bundleId = RCB.bundle.getBundle();
          
          	var bundleVariant = RCB.bundle.getBundleVariant(bundleId, variant.title);
          
          	$('#id').val(bundleVariant.id); // update the variant id
          	$('#id').attr('base-id', variant.id); // update the base variant id
        }
        else {
			$('#id').val(variant.id); // update the variant id
          	$('#id').attr('base-id', '');
        }
      
	}
  
  
  	function bindEvents() {
    
      $(document).off('click', '.product-details__variants img'); // disable original interaction
      $(document).on('click', '.product-details__variants img', function(event) {
        event.preventDefault();
        
        var id = $(this).attr('data-id');
        
        $('.product-details__variants img').removeClass('selected'); // unselect all
      	
      	$('.product-details__variants img[data-id="' + id + '"]').addClass('selected'); // select new
        
        // get the selected variant
        var variant = getSelectedVariant();
        
        // check if bundle
        var isBundle = RCB.bundle.isBundle();
        
        // set the variant as selected
        setSelectedVariant(variant, isBundle);
        
        return false;
        
      });
      
      
      $(document).on('click', '.bundle-activate-btn', function(event) {
        event.preventDefault();
        
        var bundleId = $(this).closest('.product-details__offer-holder').attr('data-bundle-product-id');
        
        var baseVariant = RCB.base.getSelectedVariant();
        
        var variant = RCB.bundle.getBundleVariant(bundleId, baseVariant.title);
        
        RCB.bundle.toggleBundle($(this), bundleId, variant.id, baseVariant.id);
        
      });
      
      
  	}


	return {
      init: function() {
        bindEvents();
      },
      getVariant: getVariant,
      getSelectedVariant: getSelectedVariant,
      setSelectedVariant: setSelectedVariant
	};

})(RCB, jQuery);


$(document).ready(function() {
  
  // product page
  if($('body.product-page').length || $('body.template-product-v2').length) {
    
    if($('.product-details__offer-holder').length) {
      RCB.base.init();
    }
  }
  
});




