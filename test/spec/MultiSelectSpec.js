var helper = {
  makeSelect: function(){
    var $select = $('<select multiple>');
    $.each(['Alice', 'Bob', 'Carol'], function(i, name){
      $('<option>').attr({
        "value": name.toLowerCase()
      }).text(name).appendTo($select);
    });
    return $select;
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
  var $select = $('<select multiple>');
  $select.append('<option selected>Alice</option>');
  $select.append('<option selected>Bob</option>');
  $select.append('<option>Carol</option>');
  $select.multiSelect();
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
  var $select = $('<select multiple>');
  $select.append('<option selected>Alice</option>');
  $select.append('<option disabled>Bob</option>');
  $select.append('<option disabled>Carol</option>');
  $select.multiSelect();
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

  it("the placeholder text shown when no selections have been made", function() {
    var $select = helper.makeSelect().multiSelect({
      placeholderText: 'My custom text'
    });
    var $container = $select.data('multiSelectContainer');

    expect(
      $container.find('.multi-select-button').text()
    ).toEqual('My custom text');
  });
});

