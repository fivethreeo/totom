mediaCheck({
  media: '(min-width: 992px)',
  entry: function() {
    $('#hjem').addClass('target');
    $('.menulink').on('click', function() {
      $('.target').removeClass('target').addClass('nottarget');
      $($(this).attr('href')).removeClass('nottarget').addClass('target');
    });
  },
  exit: function() {
    $('.pagecontent').removeClass('activateanimation');
  },
  both: function() {
    console.log('changing state 992px');
  }
});

