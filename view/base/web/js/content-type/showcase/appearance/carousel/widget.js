/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

define([
    'jquery',
    'underscore',
    'matchMedia',
    'Magento_PageBuilder/js/utils/breakpoints',
    'Magento_PageBuilder/js/events',
    'slick'
], function ($, _, mediaCheck, breakpointsUtils, events) {
    'use strict';

    /**
     * Build slick
     *
     * @param {jQuery} $carouselElement
     * @param {Object} config
     */
    function buildSlick($carouselElement, config) {
        /**
         * Prevent each slick slider from being initialized more than once which could throw an error.
         */
        if ($carouselElement.hasClass('slick-initialized')) {
            $carouselElement.slick('unslick');
        }

        config.slidesToScroll = Math.floor(config.slidesToShow);
        $carouselElement.slick(config);
    }

    /**
     * Initialize slider.
     *
     * @param {jQuery} $element
     * @param {Object} slickConfig
     * @param {Object} breakpoint
     */
    function initSlider($element, slickConfig, breakpoint) {
        var productCount = $element.find('.product-item').length,
            $carouselElement = $($element.find(".showcase-products")),
            centerModeClass = 'center-mode',
            carouselMode = $carouselElement.data('carousel-mode'),
            slidesToShow = breakpoint.options.products[carouselMode] ?
                breakpoint.options.products[carouselMode].slidesToShow :
                breakpoint.options.products.default.slidesToShow;

        slickConfig.slidesToShow = parseFloat(slidesToShow);

        if (carouselMode === 'continuous' && productCount > slickConfig.slidesToShow) {
            $carouselElement.addClass(centerModeClass);
            slickConfig.centerPadding = $element.data('center-padding');
            slickConfig.centerMode = true;
        } else {
            $carouselElement.removeClass(centerModeClass);
            slickConfig.infinite = $carouselElement.data('infinite-loop');
        }

        buildSlick($carouselElement.find(".widget-product-carousel"), slickConfig);
    }

    return function (config, element) {
        var $element = $(element),
            $carouselElement = $($element.find(".showcase-products")),
            currentViewport = config.currentViewport,
            currentBreakpoint = config.breakpoints[currentViewport],
            slickConfig = {
                autoplay: $carouselElement.data('autoplay'),
                autoplaySpeed: $carouselElement.data('autoplay-speed') || 0,
                arrows: $carouselElement.data('show-arrows'),
                dots: $carouselElement.data('show-dots')
            };

        _.each(config.breakpoints, function (breakpoint) {
            mediaCheck({
                media: breakpointsUtils.buildMedia(breakpoint.conditions),

                /** @inheritdoc */
                entry: function () {
                    initSlider($element, slickConfig, breakpoint);
                }
            });
        });

        //initialize slider when content type is added in mobile viewport
        if (currentViewport === 'mobile') {
            initSlider($element, slickConfig, currentBreakpoint);
        }

        // Redraw slide after content type gets redrawn
        events.on('contentType:redrawAfter', function (args) {
            if ($carouselElement.closest(args.element).length) {
                $carouselElement.slick('setPosition');
            }
        });

        events.on('stage:viewportChangeAfter', function (args) {
            var breakpoint = config.breakpoints[args.viewport];

            initSlider($element, slickConfig, breakpoint);
        });
    };
});
