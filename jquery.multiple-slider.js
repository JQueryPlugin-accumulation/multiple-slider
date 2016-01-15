// liukai for design detail page
//2016.1.13 start
;(function(){
    var defaults = {
        speed: 400,
        startSlide: 0,
        moveSlides: 1,
        slideWidth: 0,
        slideMargin: 0,
        preBtn: null,
        nextBtn: null,
        autoMove: false,

         // TOUCH
        touchEnabled: true,
        swipeThreshold: 50,
        preventDefaultSwipeX: true,
        preventDefaultSwipeY: false,
    };

    $.fn.multipleSlider = function(options){
        if (this.length === 0) {
            return this;
        }

        if (this.length > 1) {
            this.each(function() {
                $(this).multipleSlider(options);
            });
        }
        var slider = {},
            el = this;

        if ($(el).data('multipleSlider')) {
             return;
        }

        var init = function() {
            slider.settings = $.extend({}, defaults, options);
            slider.children = el.children();
            slider.active = {
                index: slider.settings.startSlide,
                maxIndex: slider.children.length - 1,
            };
            setup();
        };

        var setup = function() {
            slider.viewport = el.parent();
            // el.width(getSlideWidth);
            el.width(getSlideWidth());
            slider.viewport.css({
                'position': 'relative',
                'overflow': 'hidden'
            });
            el.css({
                'position': 'absolute',
                'overflow': 'hidden'
            });
            slider.children.css({
                'margin-right': slider.settings.slideMargin,
                'width': slider.settings.slideWidth,
            });
            for (var i = slider.active.maxIndex - 1; i >= 0; i--) {
                var space = getdistance(i);
                if (space > 0) {
                    slider.active.maxIndex = i + 1;
                    break;
                }
            }

            bindDirection();

            //start
            el.goToSlide(slider.settings.startSlide, true);

            if (slider.settings.touchEnabled) {
                initTouch();
            }
            if (slider.settings.autoMove) {
                initMove();
            }
        };

        var getSlideWidth = function() {
            var length = slider.children.length;
            var width = slider.settings.slideWidth;
            var margin = slider.settings.slideMargin;
            return (width + margin) * length;
        };

        var getdistance = function(slideIndex) {
            var left = slideIndex * (slider.settings.slideWidth + slider.settings.slideMargin);
            var space = getSlideWidth() - left - slider.viewport.width()- slider.settings.slideMargin;
            return space;
        };

        var bindDirection = function() {
            if (slider.settings.preBtn) {
                slider.settings.preBtn.bind('click', function() {
                    el.goToPreSlide();
                });
            }

            if (slider.settings.nextBtn) {
                slider.settings.nextBtn.bind('click', function() {
                    el.goToNextSlide();
                });
            }
        };

        el.goToNextSlide = function() {
            var pagerIndex = parseInt(slider.active.index) + slider.settings.moveSlides;
            el.goToSlide(pagerIndex);
        };

        el.goToPreSlide = function() {
            var pagerIndex = parseInt(slider.active.index) - slider.settings.moveSlides;
            el.goToSlide(pagerIndex);
        };

        el.goToSlide = function(slideIndex, judge) {
            if (slideIndex < 0) {
                slider.active.index = 0;
                el.stop().animate({'left': '0px'}, slider.settings.speed);
                return false;
            }

            slider.active.index = slideIndex;
            if (slider.active.maxIndex < slideIndex) {
                slider.active.index = slider.active.maxIndex;
            }

            console.log(slider.active.index);
            console.log(slider.settings.nextBtn);
            //判断左右按钮状态
            if (slider.settings.preBtn) {
                if (slider.active.index === 0) {
                    slider.settings.preBtn.prop('disabled', true).addClass('disabled');
                } else {
                    slider.settings.preBtn.prop('disabled', false).removeClass('disabled');
                }
            }

            if (slider.settings.nextBtn) {
                if (slider.active.index === slider.active.maxIndex) {
                    slider.settings.nextBtn.prop('disabled', true).addClass('disabled');
                } else {
                    slider.settings.nextBtn.prop('disabled', false).removeClass('disabled');
                }
            }

            var distance = 0;
            var left = slideIndex * (slider.settings.slideWidth + slider.settings.slideMargin);
            var space = getdistance(slideIndex);
            if (space < 0) {
                distance = slider.viewport.width() + slider.settings.slideMargin - getSlideWidth();
            } else {
                distance = -left;
            }

            if (slider.viewport.width() > el.width()) {
                distance = 0;
            }

            if (judge) {
                el.stop().css({'left': distance + 'px'});
            } else {
                el.stop().animate({'left': distance + 'px'}, slider.settings.speed);
            }
        };

        //touch modlue
        var initTouch = function() {
            slider.touch = {
                start: {x: 0, y: 0},
                end: {x: 0, y: 0}
            };
            slider.viewport.bind('touchstart MSPointerDown pointerdown', onTouchStart);
        };

        var onTouchStart = function(e) {
            slider.touch.originalPos = el.position();
            var orig = e.originalEvent,
            touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig];
            slider.touch.start.x = touchPoints[0].pageX;
            slider.touch.start.y = touchPoints[0].pageY;
            slider.viewport.bind('touchmove', onTouchMove);
            slider.viewport.bind('touchend', onTouchEnd);
        };

        var onTouchMove = function(e) {
            var orig = e.originalEvent,
            touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig],
            // if scrolling on y axis, do not prevent default
            xMovement = Math.abs(touchPoints[0].pageX - slider.touch.start.x),
            yMovement = Math.abs(touchPoints[0].pageY - slider.touch.start.y),
            value = 0,
            change = 0;

            // x axis swipe
            if ((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX) {
                e.preventDefault();
            // y axis swipe
            } else if ((yMovement * 3) > xMovement && slider.settings.preventDefaultSwipeY) {
                e.preventDefault();
            }
            change = touchPoints[0].pageX - slider.touch.start.x;
            value = slider.touch.originalPos.left + change;
            el.css('left', value);
        };

        var onTouchEnd = function (e) {
            slider.viewport.unbind('touchmove', onTouchMove);
            var orig    = e.originalEvent,
            touchPoints = (typeof orig.changedTouches !== 'undefined') ? orig.changedTouches : [orig],
            value       = 0,
            distance    = 0;
            // record end x, y positions
            slider.touch.end.x = touchPoints[0].pageX;
            slider.touch.end.y = touchPoints[0].pageY;

            distance = slider.touch.end.x - slider.touch.start.x;
            value = slider.touch.originalPos.left;
            if (Math.abs(distance) >= slider.settings.swipeThreshold) {
                if (distance < 0) {
                  el.goToNextSlide();
                } else {
                  el.goToPreSlide();
                }
            } else {
                el.css('left', value);
            }
            slider.viewport.unbind('touchend', onTouchEnd);
        };

        var initMove = function() {
            el.children().bind('click', function() {
                var index = $(this).parent().children().index($(this));
                if (slider.active.maxIndex === slider.active.index && getdistance(index) > 0) {
                    el.goToPreSlide();
                } else if (Math.abs(index - slider.active.index) >= slider.settings.moveSlides) {
                    if (index - slider.active.index >= slider.settings.moveSlides) {
                        el.goToNextSlide();
                    } else {
                        el.goToPreSlide();
                    }
                }
            });
        };

        el.destroySlider = function() {
            $(this).removeData('bxSlider');
        };

        el.reloadSlider = function(settings) {
            if (settings !== undefined) {
                options = settings;
            }

            el.destroySlider();

            init();

            $(el).data('multipleSlider', this);
        };

        init();

        $(el).data('multipleSlider', this);
        return this;
    };
})($);
//ps used:pc design detail page, wechat design detail page