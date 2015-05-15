mediaCheck({
  media: '(min-width: 992px)',
  entry: function() {
    if (window.location.hash=='') window.location.hash = '#hjem';
    $('.pagecontent').addClass('activateanimation');
  },
  exit: function() {
    $('.pagecontent').removeClass('activateanimation');
  },
  both: function() {
    console.log('changing state 992px');
  }
});