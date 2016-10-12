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

describe("When I press the space key while the button is focussed", function(){
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

    var e = jQuery.Event('keydown');
    e.which = 32;
    $container.children('.multi-select-button').trigger(e);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);
  });
});

describe("When I press the enter key while the button is focussed", function(){
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

    var e = jQuery.Event('keydown');
    e.which = 13;
    $container.children('.multi-select-button').trigger(e);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(true);
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

describe("When I press the escape key while the menu is focussed", function(){
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

    var e = jQuery.Event('keyup');
    e.which = 27;
    $container.children('.multi-select-menu').trigger(e);

    expect(
      $container.hasClass('multi-select-container--open')
    ).toBe(false);
  });
});

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

