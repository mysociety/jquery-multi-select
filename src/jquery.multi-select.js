// jquery.multi-select.js
// by mySociety
// https://github.com/mysociety/jquery-multi-select

;(function($) {

  "use strict";

  var pluginName = "multiSelect",
    defaults = {
      containerHTML: '<div class="multi-select-container">',
      menuHTML: '<div class="multi-select-menu">',
      buttonHTML: '<span class="multi-select-button">',
      menuItemHTML: '<label class="multi-select-menuitem">',
      activeClass: 'multi-select-container--open',
      noneText: '-- Select --',
      allText: undefined
    };

  function Plugin(element, options) {
    this.element = element;
    this.$element = $(element);
    this.settings = $.extend( {}, defaults, options );
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  $.extend(Plugin.prototype, {

    init: function() {
      this.checkSuitableInput();
      this.findLabels();
      this.constructContainer();
      this.constructButton();
      this.constructMenu();

      this.setUpBodyClickListener();
      this.setUpLabelsClickListener();

      this.$element.hide();
    },

    checkSuitableInput: function(text) {
      if ( this.$element.is('select[multiple]') === false ) {
        throw new Error('$.multiSelect only works on <select multiple> elements');
      }
    },

    findLabels: function() {
      this.$labels = $('label[for="' + this.$element.attr('id') + '"]');
    },

    constructContainer: function() {
      this.$container = $(this.settings.containerHTML);
      this.$element.data('multi-select-container', this.$container);
      this.$container.insertAfter(this.$element);
    },

    constructButton: function() {
      var _this = this;
      this.$button = $(this.settings.buttonHTML);
      this.$button.attr({
        'role': 'button',
        'aria-haspopup': 'true',
        'tabindex': 0,
        'aria-label': this.$labels.eq(0).text()
      })
      .on('keydown', function(e) {
        var key = e.which;
        var returnKey = 13;
        var spaceKey = 32;
        if ((key === returnKey) || (key === spaceKey)) {
          _this.$button.click();
        }
      }).on('click', function(e) {
        _this.$container.toggleClass(_this.settings.activeClass);
      });

      this.$element.on('change', function() {
        _this.updateButtonContents();
      });

      this.$container.append(this.$button);

      this.updateButtonContents();
    },

    constructMenu: function() {
      var _this = this;

      this.$menu = $(this.settings.menuHTML);
      this.$menu.attr({
        'role': 'menu'
      }).on('keyup', function(e){
        var key = e.which;
        var escapeKey = 27;
        if (key === escapeKey) {
          _this.$container.removeClass(_this.settings.activeClass);
        }
      });

      this.$menu.on('change', function() {
        _this.updateButtonContents();
      });

      this.$element.on('change', function(e, internal) {
        // Don't need to update the menu contents if this
        // change event was fired by our tickbox handler.
        if(internal !== true){
          _this.updateMenuContents();
        }
      });

      this.$container.append(this.$menu);

      this.updateMenuContents();
    },

    setUpBodyClickListener: function() {
      var _this = this;

      // Hide the $menu when you click outside of it.
      $('html').on('click', function(){
        _this.$container.removeClass(_this.settings.activeClass);
      });

      // Stop click events from inside the $button or $menu from
      // bubbling up to the body and closing the menu!
      this.$container.on('click', function(e){
        e.stopPropagation();
      });
    },

    setUpLabelsClickListener: function() {
      var _this = this;
      this.$labels.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this.$container.toggleClass(_this.settings.activeClass);
      });
    },

    updateMenuContents: function() {
      var _this = this;
      this.$menu.empty();
      this.$element.children('option').each(function(option_index, option) {
        var $item = _this.constructMenuItem($(option), option_index);
        _this.$menu.append($item);
      });
    },

    constructMenuItem: function($option, option_index) {
      var unique_id = this.$element.attr('name') + '_' + option_index;
      var $item = $(this.settings.menuItemHTML)
        .attr({
          'for': unique_id,
          'role': 'menuitem'
        })
        .text(' ' + $option.text());

      var $input = $('<input>')
        .attr({
          'type': 'checkbox',
          'id': unique_id,
          'value': $option.val()
        });
      if ( $option.is(':disabled') ) {
        $input.attr('disabled', 'disabled');
      }
      if ( $option.is(':selected') ) {
        $input.prop('checked', 'checked');
      }

      $input.on('change', function() {
        if ($(this).prop('checked')) {
          $option.prop('selected', true);
        } else {
          $option.prop('selected', false);
        }

        // .prop() on its own doesn't generate a change event.
        // Other plugins might want to do stuff onChange.
        $option.trigger('change', [true]);
      });

      $item.prepend($input);
      return $item;
    },

    updateButtonContents: function() {
      var _this = this;
      var options = [];
      var selected = [];

      this.$element.children('option').each(function() {
        var text = $(this).text();
        options.push(text);
        if ($(this).is(':selected')) {
          selected.push( $.trim(text) );
        }
      });

      this.$button.empty();

      if (selected.length == 0) {
        this.$button.text( this.settings.noneText );
      } else if ( (selected.length === options.length) && this.settings.allText) {
        this.$button.text( this.settings.allText );
      } else {
        this.$button.text( selected.join(', ') );
      }
    }

  });

  $.fn[ pluginName ] = function(options) {
    return this.each(function() {
      if ( !$.data(this, "plugin_" + pluginName) ) {
        $.data(this, "plugin_" + pluginName,
          new Plugin(this, options) );
      }
    });
  };

})(jQuery);
