var helper = {
  makeSelect: function(options){
    var options = options || {'Alice': [], 'Bob': [], 'Carol': []};

    var $select = $('<select multiple>');

    $.each(options, function(label, listOfAttributes){
      $('<option>').text(label).attr({
        'value': label.toLowerCase()
      }).prop({
        'selected': listOfAttributes.indexOf('selected') !== -1,
        'disabled': listOfAttributes.indexOf('disabled') !== -1
      }).appendTo($select);
    });

    return $select;
  }
}

var customMatchers = {
  toBeLessThanOrEqualTo: function() {
    return {
      compare: function(firstThing, secondThing) {
        var result = {
          pass: firstThing <= secondThing
        };
        if (result.pass) {
          // Used in the case of a .not matcher
          result.message = "Expected " + firstThing + " not to be less than or equal to " + secondThing;
        } else {
          result.message = "Expected " + firstThing + " to be less than or equal to " + secondThing;
        }
        return result;
      }
    }
  }
}

describe("$(element).multiSelect()", function() {

  it("should be a jQuery plugin", function() {
    expect(function(){
      helper.makeSelect().multiSelect()
    }).not.toThrow();
  });

  it("should throw an error when called on something other than a <select> element", function() {
    expect(function(){
      $('<p>').multiSelect()
    }).toThrow();
  });

  it("should throw an error when called on a <select> element without a `multiple` attribute", function() {
    expect(function(){
      $('<select>').multiSelect()
    }).toThrow();
  });

});

describe("$(element).multiSelect().data('multiSelectContainer')", function() {
  var $select = helper.makeSelect().multiSelect();
  var $container = $select.data('multiSelectContainer');

  it("should be a reference to the container element added by multiSelect", function() {
    expect(
      $container.is('div.multi-select-container')
    ).toBe(true);
  });

  it("should be inserted after the original <select>", function() {
    expect(
      $container.prev().is('select[multiple]')
    ).toBe(true);
  });

  it("should contain a button", function() {
    expect(
      $container.children('.multi-select-button').length
    ).toEqual(1);
  });

  it("should contain a (hidden) menu", function() {
    expect(
      $container.children('.multi-select-menu').length
    ).toEqual(1);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);
  });

  it("should contain a menu item for each <option> in the original <select>", function() {
    expect(
      $container.find('.multi-select-menuitem').length
    ).toEqual(3);
  });

  it("should contain a checkbox for each <option> in the original <select>", function() {
    expect(
      $container.find('input:checkbox').length
    ).toEqual(3);
  });

});

describe("Calling .multiSelect() on a <select> with pre-selected <options>", function() {
  var $select = helper.makeSelect({
    'Alice': ['selected'],
    'Bob': ['selected'],
    'Carol': []
  }).multiSelect();
  var $container = $select.data('multiSelectContainer');

  it("ticks the corresponding checkboxes in the menu", function() {
    expect(
      $container.find('input:checked').length
    ).toEqual(2);
  });

  it("displays the chosen options, concatenated, in the button text", function() {
    expect(
      $container.find('.multi-select-button').text()
    ).toEqual( ['Alice', 'Bob'].join(', ') );
  });
});

describe("Calling .multiSelect() on a <select> with disabled <options>", function() {
  var $select = helper.makeSelect({
    'Alice': ['selected'],
    'Bob': ['disabled'],
    'Carol': ['disabled']
  }).multiSelect();
  var $container = $select.data('multiSelectContainer');

  it("disables the corresponding checkboxes in the menu", function() {
    expect(
      $container.find('input:disabled').length
    ).toEqual(2);
  });
});

describe("When I tick checkboxes in the menu", function() {
  var $select, $container;

  beforeEach(function(){
    // We need to insert the $select into the DOM to make
    // the `click` events work like they would normally.
    $select = helper.makeSelect().appendTo('body').multiSelect();
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("a `change` event is triggered on the <select> element", function() {
    var changed = false;

    // Spy on the change event.
    $select.on('change', function(){
      changed = true;
    });

    $container.find('input[value="alice"]').trigger('click');

    expect(changed).toBe(true);
  });

  it("the correct <option>s are selected", function() {
    $container.find('input[value="alice"]').trigger('click');
    $container.find('input[value="carol"]').trigger('click');

    expect(
      $select.val()
    ).toEqual(["alice", "carol"]);
  });

  it("displays the chosen options, concatenated, in the button text", function() {
    $container.find('input[value="alice"]').trigger('click');
    $container.find('input[value="carol"]').trigger('click');

    expect(
      $container.find('.multi-select-button').text()
    ).toEqual( ['Alice', 'Carol'].join(', ') );
  });
});

describe("When the <select> is changed in the background", function(){
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().appendTo('body').multiSelect();
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the menu checkboxes update to reflect selected <option>s", function() {
    $select.find('option[value="bob"]').prop('selected', true).trigger('change');

    expect(
      $container.find('input[value="bob"]').is(':checked')
    ).toBe(true);
  });

  it("the menu checkboxes update to reflect disabled <option>s", function() {
    $select.find('option[value="bob"]').prop('disabled', true).trigger('change');

    expect(
      $container.find('input[value="bob"]').is(':disabled')
    ).toBe(true);
  });
});

describe("When I click the button", function(){
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().appendTo('body').multiSelect();
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the container is given an activeClass", function() {
    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);

    $container.children('.multi-select-button').trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);
  });
});

describe("When I press a key while the button is focussed", function(){
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().appendTo('body').multiSelect();
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the container is given an activeClass (space)", function() {
    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);

    var e = jQuery.Event('keydown');
    e.which = 32;
    $container.children('.multi-select-button').trigger(e);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);
  });

  it("the container is given an activeClass (return)", function() {
    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);

    var e = jQuery.Event('keydown');
    e.which = 13;
    $container.children('.multi-select-button').trigger(e);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);
  });

  it("the container is given an activeClass (down) and focusses the first option", function() {
    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);

    var e = jQuery.Event('keydown');
    e.which = 40;
    $container.children('.multi-select-button').trigger(e);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);
    expect(document.activeElement).toEqual($container.find('input:first')[0]);
  });
});

describe("When I press arrow keys on menu items", function(){
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().appendTo('body').multiSelect();
    $container = $select.data('multiSelectContainer');
    $container.children('.multi-select-button').trigger('click');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the focus moves up items", function() {
    var e = jQuery.Event('keydown');
    e.which = 38;
    $container.find('label:nth-child(2)').trigger(e);
    expect(document.activeElement).toEqual($container.find('input')[0]);
  });

  it("the focus moves down items", function() {
    var e = jQuery.Event('keydown');
    e.which = 40;
    $container.find('label:nth-child(2)').trigger(e);
    expect(document.activeElement).toEqual($container.find('input')[2]);
  });

  it("the focus moves up to the button from the first item", function() {
    var e = jQuery.Event('keydown');
    e.which = 38;
    $container.find('label:nth-child(1)').trigger(e);
    expect(document.activeElement).toEqual($container.children('.multi-select-button')[0]);
  });

  it("the focus stays the same on the last item", function() {
    var e = jQuery.Event('keydown');
    e.which = 40;
    $container.find('label:nth-child(3)').focus();
    $container.find('label:nth-child(3)').trigger(e);
    expect(document.activeElement).toEqual($container.find('input')[2]);
  });
});

describe("When I click inside an active menu", function(){
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().appendTo('body').multiSelect();
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the container keeps its activeClass", function() {
    $container.children('.multi-select-button').trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);

    $container.find('label').trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);
  });
});

describe("When I click outside an active menu", function(){
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().appendTo('body').multiSelect();
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the container loses its activeClass", function() {
    $container.children('.multi-select-button').trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);

    $container.parent().trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);
  });
});

describe("When I open a second menu while another menu is already active", function(){
  var $select1, $select2, $container1, $container2;

  beforeEach(function(){
    $select1 = helper.makeSelect().appendTo('body').multiSelect();
    $select2 = helper.makeSelect().appendTo('body').multiSelect();
    $container1 = $select1.data('multiSelectContainer');
    $container2 = $select2.data('multiSelectContainer');
  });

  afterEach(function(){
    $select1.remove();
    $select2.remove();
    $container1.remove();
    $container2.remove();
  });

  it("the active menu loses its activeClass", function() {
    $container1.children('.multi-select-button').trigger('click');

    expect(
      $container1.hasClass('multi-select-container--open')
    ).toBe(true);

    expect(
      $container2.hasClass('multi-select-container--open')
    ).toBe(false);

    $container2.children('.multi-select-button').trigger('click');

    expect(
      $container1.hasClass('multi-select-container--open')
    ).toBe(false);

    expect(
      $container2.hasClass('multi-select-container--open')
    ).toBe(true);
  });
});

describe("When I press the escape key", function(){
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().appendTo('body').multiSelect();
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the container loses its activeClass (menu focussed)", function() {
    $container.children('.multi-select-button').trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);

    var e = jQuery.Event('keyup');
    e.which = 27;
    $container.children('.multi-select-menu').trigger(e);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);
  });

  it("the container loses its activeClass (button focussed)", function() {
    $container.children('.multi-select-button').trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);

    var e = jQuery.Event('keydown');
    e.which = 27;
    $container.children('.multi-select-button').trigger(e);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);
  });});

describe("When no <option>s are selected", function() {

  describe("If custom `noneText` was provided", function() {
    var $select, $container;

    afterEach(function() {
      $select.remove();
      $container.remove();
    });

    it("the button displays the custom `noneText`", function() {
      $select = helper.makeSelect().appendTo('body').multiSelect({
        'noneText': 'None of the options'
      });
      $container = $select.data('multiSelectContainer');

      expect(
        $container.find('.multi-select-button').text()
      ).toEqual('None of the options');
    });
  });

  describe("If custom `noneText` was not provided", function() {
    var $select, $container;

    afterEach(function() {
      $select.remove();
      $container.remove();
    });

    it("the button displays the default `noneText`", function() {
      $select = helper.makeSelect().appendTo('body').multiSelect();
      $container = $select.data('multiSelectContainer');

      expect(
        $container.find('.multi-select-button').text()
      ).toEqual('-- Select --');
    });
  });
});

describe("When all <option>s are selected", function() {

  describe("If custom `allText` was provided", function() {
    var $select, $container;

    beforeEach(function() {
      $select = helper.makeSelect({
        'Alice': ['selected'],
        'Bob': ['selected'],
        'Carol': ['selected']
      }).appendTo('body').multiSelect({
        'allText': 'All the options'
      });
      $container = $select.data('multiSelectContainer');
    });

    afterEach(function() {
      $select.remove();
      $container.remove();
    });

    it("the button displays the custom `allText`", function() {
      expect(
        $container.find('.multi-select-button').text()
      ).toEqual('All the options');
    });
  });

  describe("If no `allText` was provided", function() {
    var $select, $container;

    afterEach(function() {
      $select.remove();
      $container.remove();
    });

    it("the button displays a comma-separated list of checked options", function() {
      $select = helper.makeSelect({
        'Alice': ['selected'],
        'Bob': ['selected'],
        'Carol': ['selected']
      }).appendTo('body').multiSelect();
      $container = $select.data('multiSelectContainer');

      expect(
        $container.find('.multi-select-button').text()
      ).toEqual('Alice, Bob, Carol');
    });

    it("leading and trailing whitespace in option names is ignored", function() {
      $select = helper.makeSelect({
        '    Alice  ': ['selected'],
        'Bob  ': ['selected'],
        '    Carol': ['selected']
      }).appendTo('body').multiSelect();
      $container = $select.data('multiSelectContainer');

      expect(
        $container.find('.multi-select-button').text()
      ).toEqual('Alice, Bob, Carol');
    });
  });
});

describe("When a list of `presets` is provided", function() {
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect({
      'Alice': [],
      'Bob': [],
      'Carol': []
    }).appendTo('body').multiSelect({
      presets: [
        {
          name: 'No people',
          options: []
        },
        {
          name: 'My friends',
          options: ['alice', 'carol']
        }
      ]
    });
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the presets are presented as radio buttons at the top of the menu", function() {
    expect(
      $container.find('.multi-select-presets input[type="radio"]').length
    ).toEqual(2);
  });

  it("the presets are listed in the order they were originally provided", function() {
    expect(
      $.trim(
        $container.find('.multi-select-presets label:nth-child(1)').text()
      )
    ).toEqual('No people');
    expect(
      $.trim(
        $container.find('.multi-select-presets label:nth-child(2)').text()
      )
    ).toEqual('My friends');
  });

  it("the correct starting preset is selected", function(){
    expect(
      $container.find('.multi-select-presets label:nth-child(1) input')[0].checked
    ).toBe(true);
  });

  describe("When the selected options are changed to match another preset", function(){
    // This beforeEach will run after the parent beforeEach, where
    // the <select> is created with no options selected.
    beforeEach(function(){
      $container.find('input[value="alice"], input[value="carol"]').each(function(){
        $(this).trigger('click');
      });
    });

    it("the correct preset is selected", function(){
      expect(
        $container.find('.multi-select-presets label:nth-child(2) input')[0].checked
      ).toBe(true);

      expect(
        $container.find('.multi-select-presets label:nth-child(1) input')[0].checked
      ).toBe(false);
    });
  });

  describe("When the selected options are changed, such that no preset matches", function(){
    // This beforeEach will run after the parent beforeEach, where
    // the <select> is created with no options selected.
    beforeEach(function(){
      $container.find('input[value="alice"]').trigger('click');
    });

    it("no preset is selected", function(){
      expect(
        $container.find('.multi-select-presets label:nth-child(1) input')[0].checked
      ).toBe(false);

      expect(
        $container.find('.multi-select-presets label:nth-child(2) input')[0].checked
      ).toBe(false);
    });
  });

  describe("When I click a preset", function(){
    // This beforeEach will run after the parent beforeEach, where
    // the <select> is created with no options selected.
    beforeEach(function(){
      $container.find('.multi-select-presets label:nth-child(2) input').trigger('click');
    });

    it("ticks the corresponding options in the menu", function(){
      expect(
        $container.find('input[value="alice"]')[0].checked
      ).toBe(true);

      expect(
        $container.find('input[value="bob"]')[0].checked
      ).toBe(false);

      expect(
        $container.find('input[value="carol"]')[0].checked
      ).toBe(true);

      expect(
        $select.val()
      ).toEqual(["alice", "carol"]);
    });
  });
});

describe("When no `presets` are provided", function() {
  var $select = helper.makeSelect().multiSelect();
  var $container = $select.data('multiSelectContainer');

  it("there are no presets in the menu", function() {
    expect(
      $container.find('.multi-select-presets').length
    ).toEqual(0);
  });
});

describe("When `modalHTML` is provided", function() {
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().multiSelect({
      modalHTML: '<div class="multi-select-modal">'
    });
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("the modal element is inserted into the container, between the button and the menu", function(){
    expect(
      $container.children('.multi-select-modal').length
    ).toEqual(1);
    expect(
      $container.children('.multi-select-button').next().is('div.multi-select-modal')
    ).toBe(true);
    expect(
      $container.children('.multi-select-menu').prev().is('div.multi-select-modal')
    ).toBe(true);
  });

  it("clicks on the modal element close the menu", function(){
    $container.children('.multi-select-button').trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);

    $container.children('.multi-select-modal').trigger('click');

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);
  });
});

describe("When no `modalHTML` is provided", function() {
  var $select, $container;

  beforeEach(function(){
    $select = helper.makeSelect().multiSelect();
    $container = $select.data('multiSelectContainer');
  });

  afterEach(function(){
    $select.remove();
    $container.remove();
  });

  it("no modal element is inserted into the container", function() {
    expect(
      $container.find('.multi-select-modal').length
    ).toEqual(0);

    expect(
      $container.children().length
    ).toEqual(2);
  });
});

describe("I can customise", function() {
  it("the HTML markup of the container element", function() {
    var $select = helper.makeSelect().multiSelect({
      containerHTML: '<span class="my-custom-class">'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.is('span.my-custom-class')
    ).toBe(true);
  });

  it("the HTML markup of the button element", function() {
    var $select = helper.makeSelect().multiSelect({
      buttonHTML: '<b class="my-custom-class">'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('b.my-custom-class').length
    ).toEqual(1);
  });

  it("the HTML markup of the menu element", function() {
    var $select = helper.makeSelect().multiSelect({
      menuHTML: '<nav class="my-custom-class">'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('nav.my-custom-class').length
    ).toEqual(1);
  });

  it("the HTML markup of the menu item elements", function() {
    var $select = helper.makeSelect().multiSelect({
      menuItemHTML: '<li class="my-custom-class">'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('li.my-custom-class').length
    ).toEqual(3);
  });

  it("the HTML markup of the presets element", function() {
    var $select = helper.makeSelect().multiSelect({
      presetsHTML: '<div class="my-custom-presets">',
      presets: [
        {
          name: 'No people',
          options: []
        }
      ]
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('.multi-select-menu > .my-custom-presets').length
    ).toEqual(1);
  });

  it("the activeClass applied to the container when the menu is to be shown", function() {
      var $select = helper.makeSelect().appendTo('body').multiSelect({
        activeClass: 'my-custom-active-class'
      });
      var $container = $select.data('multiSelectContainer');

      $container.children('.multi-select-button').trigger('click');

      expect(
        $container.hasClass('multi-select-container--open')
      ).toBe(false);

      expect(
        $container.hasClass('my-custom-active-class')
      ).toBe(true);

      $select.remove();
      $container.remove();
  });

  it("the text shown when no options have been selected", function() {
    var $select = helper.makeSelect().multiSelect({
      noneText: 'No options selected'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('.multi-select-button').text()
    ).toEqual('No options selected');
  });

  it("the text shown when all options have been selected", function() {
    var $select = helper.makeSelect({
      'Alice': ['selected'],
      'Bob': ['selected'],
      'Carol': ['selected']
    }).multiSelect({
      allText: 'All options selected'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('.multi-select-button').text()
    ).toEqual('All options selected');
  });

  it("an element within which the menu should be contained", function() {
    jasmine.addMatchers(customMatchers);

    var $within = $('<div>').addClass('position-menu-within').appendTo('body');
    var $select = helper.makeSelect({
      'The final option…': [],
      'Should wrap onto…': [],
      'Multiple lines, to avoid expanding outside the grey wrapper': []
    }).appendTo($within);
    $select.multiSelect({
      positionMenuWithin: $within
    });
    var $container = $select.data('multiSelectContainer');
    var $menu = $container.find('.multi-select-menu');

    $container.children('.multi-select-button').trigger('click');

    expect(
      $menu.offset().left + $menu.outerWidth()
    ).toBeLessThanOrEqualTo(
      $within.offset().left + $within.outerWidth()
    );

    $within.remove();
  })
});

