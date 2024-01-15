// jquery.multi-select.js
// by mySociety
// https://github.com/mysociety/jquery-multi-select

;(function($) {

  "use strict";

  var pluginName = "multiSelect",
    defaults = {
      'containerHTML': '<div class="multi-select-container">',
      'menuHTML': '<div class="multi-select-menu">',
      'buttonHTML': '<span class="multi-select-button">',
      'menuItemsHTML': '<div class="multi-select-menuitems">',
      'menuFieldsetHTML': '<fieldset class="multi-select-fieldset">',
      'menuFieldsetLegendHTML': '<legend class="multi-select-legend">',
      'menuItemHTML': '<label class="multi-select-menuitem">',
      'presetsHTML': '<div class="multi-select-presets">',
      'modalHTML': undefined,
      'activeClass': 'multi-select-container--open',
      'noneText': '-- Select --',
      'allText': undefined,
      'presets': undefined,
      'positionedMenuClass': 'multi-select-container--positioned',
      'positionMenuWithin': undefined,
      'viewportBottomGutter': 20,
      'menuMinHeight': 200
    };

  /**
   * @constructor
   */
  function MultiSelect(element, options) {
    this.element = element;
    this.$element = $(element);
    this.settings = $.extend( {}, defaults, options );
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  function arraysAreEqual(array1, array2) {
    if ( array1.length != array2.length ){
      return false;
    }

    array1.sort();
    array2.sort();

    for ( var i = 0; i < array1.length; i++ ){
      if ( array1[i] !== array2[i] ){
        return false;
      }
    }

    return true;
  }

  $.extend(MultiSelect.prototype, {

    init: function() {
      this.checkSuitableInput();
      this.findLabels();
      this.constructContainer();
      this.constructButton();
      this.constructMenu();
      this.constructModal();

      this.setUpBodyClickListener();
      this.setUpLabelsClickListener();

      this.hideOriginalElement();
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
      this.$container = $(this.settings['containerHTML']);
      this.$element.data('multi-select-container', this.$container);
      this.$container.insertAfter(this.$element);
    },

    constructButton: function() {
      var _this = this;
      this.$button = $(this.settings['buttonHTML']);
      this.$button.attr({
        'role': 'button',
        'aria-haspopup': 'true',
        'tabindex': 0,
        'aria-label': this.$labels.eq(0).text()
      })
      .on('keydown.multiselect', function(e) {
        var key = e.which;
        var returnKey = 13;
        var escapeKey = 27;
        var spaceKey = 32;
        var downArrow = 40;
        if ((key === returnKey) || (key === spaceKey)) {
          e.preventDefault();
          _this.$button.click();
        } else if (key === downArrow) {
          e.preventDefault();
          _this.menuShow();
          var group = _this.$presets || _this.$menuItems;
          group.children().first().focus();
        } else if (key === escapeKey) {
          _this.menuHide();
        }
      }).on('click.multiselect', function(e) {
        _this.menuToggle();
      }).on('blur.multiselect', this.checkBlur.bind(this))
      .appendTo(this.$container);

      this.$element.on('change.multiselect', function() {
        _this.updateButtonContents();
      });

      this.updateButtonContents();
    },

    updateButtonContents: function() {
      var _this = this;
      var options = [];
      var selected = [];

      this.$element.find('option').each(function() {
        var text = /** @type string */ ($(this).text());
        options.push(text);
        if ($(this).is(':selected')) {
          selected.push( $.trim(text) );
        }
      });

      this.$button.empty();

      if (selected.length == 0) {
        this.$button.text( this.settings['noneText'] );
      } else if ( (selected.length === options.length) && this.settings['allText']) {
        this.$button.text( this.settings['allText'] );
      } else {
        this.$button.text( selected.join(', ') );
      }
    },

    constructMenu: function() {
      var _this = this;

      this.$menu = $(this.settings['menuHTML']);
      this.$menu.attr({
        'role': 'menu'
      }).on('keyup.multiselect', function(e){
        var key = e.which;
        var escapeKey = 27;
        if (key === escapeKey) {
          _this.menuHide();
          _this.$button.focus();
        }
      })
      .appendTo(this.$container);

      this.constructMenuItems();

      if ( this.settings['presets'] ) {
        this.constructPresets();
      }
    },

    constructMenuItems: function() {
      var _this = this;

      this.$menuItems = $(this.settings['menuItemsHTML']);
      this.$menu.append(this.$menuItems);

      this.$element.on('change.multiselect', function(e, internal) {
        // Don't need to update the menu items if this
        // change event was fired by our tickbox handler.
        if(internal !== true){
          _this.updateMenuItems();
        }
      });

      this.updateMenuItems();
    },

    updateMenuItems: function() {
      var _this = this;
      this.$menuItems.empty();

      this.$element.children('optgroup,option').each(function(index, element) {
        var $item;
        if (element.nodeName === 'OPTION') {
          $item = _this.constructMenuItem($(element), index);
          _this.$menuItems.append($item);
        } else {
          _this.constructMenuItemsGroup($(element), index);
        }
      });
    },

    upDown: function(type, e) {
      // target is a label, could be a preset, a menu item in a fieldset
      // or a menu item not in a fieldset

      var key = e.which;
      var upArrow = 38;
      var downArrow = 40;

      if (key === upArrow) {
        e.preventDefault();
        var target = e.currentTarget,
            prev = target.previousElementSibling;
        if (prev && prev.nodeName === 'LEGEND') { prev = null; }
        if (!prev) {
          // If empty, prev could be start of a fieldset, start of presets, start of menu items
          prev = target.parentNode.previousElementSibling;
        }
        if (prev) {
          if (prev.nodeName === 'LABEL') {
            prev.focus();
          } else {
            prev.lastChild.focus();
          }
        } else {
          this.$button.focus();
        }
      } else if (key === downArrow) {
        e.preventDefault();
        // next could be another label, or a fieldset, or nothing.
        var target = e.currentTarget,
            next = target.nextElementSibling;
        if (!next) {
          // If empty, next could be end of a fieldset, end of presets, end of menu items
          next = target.parentNode.nextElementSibling;
        }
        if (next) {
          if (next.nodeName === 'LABEL') {
            next.focus();
          } else {
            next.querySelector('label').focus();
          }
        }
      }
    },

    constructPresets: function() {
      var _this = this;
      this.$presets = $(this.settings['presetsHTML']);
      this.$menu.prepend(this.$presets);

      $.each(this.settings['presets'], function(i, preset){
        var unique_id = _this.$element.attr('name') + '_preset_' + i;
        var $item = $(_this.settings['menuItemHTML'])
          .attr({
            'for': unique_id,
            'role': 'menuitem'
          })
          .text(' ' + preset.name)
          .on('keydown.multiselect', _this.upDown.bind(_this, 'preset'))
          .appendTo(_this.$presets);

        var $input = $('<input>')
          .attr({
            'type': 'radio',
            'name': _this.$element.attr('name') + '_presets',
            'id': unique_id
          })
          .prependTo($item);

        if (preset.all) {
          preset.options = [];
          _this.$element.find('option').each(function() {
            var val = $(this).val();
            preset.options.push(val);
          });
        }

        $input.on('change.multiselect', function(){
          _this.$element.val(preset.options);
          _this.$element.trigger('change');
        }).on('blur.multiselect', _this.checkBlur.bind(_this));
      });

      this.$element.on('change.multiselect', function() {
        _this.updatePresets();
      });

      this.updatePresets();
    },

    updatePresets: function() {
      var _this = this;

      $.each(this.settings['presets'], function(i, preset){
        var unique_id = _this.$element.attr('name') + '_preset_' + i;
        var $input = _this.$presets.find('#' + unique_id);

        if ( arraysAreEqual(preset.options || [], _this.$element.val() || []) ){
          $input.prop('checked', true);
        } else {
          $input.prop('checked', false);
        }
      });
    },

    constructMenuItemsGroup: function($optgroup, optgroup_index) {
      var _this = this;
      var $fieldset = $(_this.settings['menuFieldsetHTML']);
      var groupTitle = $optgroup.attr('label');
      $fieldset.attr('data-label', groupTitle);
      var $legend = $(_this.settings['menuFieldsetLegendHTML']).text(groupTitle);
      $fieldset.append($legend);

      $optgroup.children('option').each(function(option_index, option) {
        var $item = _this.constructMenuItem($(option), optgroup_index + '_' + option_index);
        $fieldset.append($item);
      });

      _this.$menuItems.append($fieldset);
    },

    constructMenuItem: function($option, option_index) {
      var unique_id = this.$element.attr('name') + '_' + option_index;
      var $item = $(this.settings['menuItemHTML'])
        .attr({
          'for': unique_id,
          'role': 'menuitem'
        })
        .on('keydown.multiselect', this.upDown.bind(this, 'menuitem'))
        .text(' ' + $option.text());

      var $input = $('<input>')
        .attr({
          'type': 'checkbox',
          'id': unique_id,
          'value': $option.val()
        })
        .prependTo($item);

      if ( $option.is(':disabled') ) {
        $input.attr('disabled', 'disabled');
      }
      if ( $option.is(':selected') ) {
        $input.prop('checked', 'checked');
      }

      $input.on('change.multiselect', function() {
        if ($(this).prop('checked')) {
          $option.prop('selected', true);
        } else {
          $option.prop('selected', false);
        }

        // .prop() on its own doesn't generate a change event.
        // Other plugins might want to do stuff onChange.
        $option.trigger('change', [true]);
      }).on('blur.multiselect', this.checkBlur.bind(this));

      return $item;
    },

    constructModal: function() {
      var _this = this;

      if (this.settings['modalHTML']) {
        this.$modal = $(this.settings['modalHTML']);
        this.$modal.on('click.multiselect', function(){
          _this.menuHide();
        })
        this.$modal.insertBefore(this.$menu);
      }
    },

    setUpBodyClickListener: function() {
      var _this = this;

      // Hide the $menu when you click outside of it.
      $('html').on('click.multiselect', function(){
        _this.menuHide();
      });

      // Stop click events from inside the $button or $menu from
      // bubbling up to the body and closing the menu!
      this.$container.on('click.multiselect', function(e){
        e.stopPropagation();
      });
    },

    setUpLabelsClickListener: function() {
      var _this = this;
      this.$labels.on('click.multiselect', function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this.menuToggle();
      });
    },

    hideOriginalElement: function() {
      this.$element.hide();
      this.$labels.removeAttr('for');
    },

    menuShow: function() {
      $('html').trigger('click.multiselect'); // Close any other open menus
      this.$container.addClass(this.settings['activeClass']);

      if ( this.settings['positionMenuWithin'] && this.settings['positionMenuWithin'] instanceof $ ) {
        var menuLeftEdge = this.$menu.offset().left + this.$menu.outerWidth();
        var withinLeftEdge = this.settings['positionMenuWithin'].offset().left +
          this.settings['positionMenuWithin'].outerWidth();

        if ( menuLeftEdge > withinLeftEdge ) {
          this.$menu.css( 'width', (withinLeftEdge - this.$menu.offset().left) );
          this.$container.addClass(this.settings['positionedMenuClass']);
        }
      }

      var menuBottom = this.$menu.offset().top + this.$menu.outerHeight();
      var viewportBottom = $(window).scrollTop() + $(window).height();
      if ( menuBottom > viewportBottom - this.settings['viewportBottomGutter'] ) {
        this.$menu.css({
          'maxHeight': Math.max(
            viewportBottom - this.settings['viewportBottomGutter'] - this.$menu.offset().top,
            this.settings['menuMinHeight']
          ),
          'overflow': 'scroll'
        });
      } else {
        this.$menu.css({
          'maxHeight': '',
          'overflow': ''
        });
      }
    },

    menuHide: function() {
      this.$container.removeClass(this.settings['activeClass']);
      this.$container.removeClass(this.settings['positionedMenuClass']);
      this.$menu.css('width', 'auto');
    },

    menuToggle: function() {
      if ( this.$container.hasClass(this.settings['activeClass']) ) {
        this.menuHide();
      } else {
        this.menuShow();
      }
    },

    checkBlur: function(e) {
      if (e.relatedTarget && !$(e.relatedTarget).closest(this.$container).length) {
        this.menuHide();
      }
    }

  });

  $.fn[ pluginName ] = function(options) {
    return this.each(function() {
      if ( !$.data(this, "plugin_" + pluginName) ) {
        $.data(this, "plugin_" + pluginName,
          new MultiSelect(this, options) );
      }
    });
  };

})(jQuery);
