Barba.Pjax.start();

var FadeTransition = Barba.BaseTransition.extend({
  start: function() {
    Promise.all([this.newContainerLoading, this.fadeOut()]).then(
      this.fadeIn.bind(this)
    );
  },

  fadeOut: function() {},

  fadeIn: function() {
    this.newContainer.classList.add("slide-in");

    var that = this;

    this.newContainer.addEventListener("animationend", function() {
      that.newContainer.classList.remove("slide-in");
      that.done();
    });
  }
});

Barba.Pjax.getTransition = function() {
  return FadeTransition;
};
