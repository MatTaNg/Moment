(function() {

  angular.module('notificationManager', [])

  .service('notificationManager', ['localStorageManager', 'constants', notificationManager]);

  function notificationManager(localStorageManager, constants ) {
    var notifications = localStorageManager.get("notificationStatus");
    if(notifications.length === 0) {
      notifications = 
      [
          { id: "ALL", settingsText: "Notifications", notification: true },
          { id: constants.MORE_MOMENTS_FOUND, settingsText: "More Moments are found", notification: true},
          { id: constants.MOMENT_BECOMES_BEST_MOMENT, settingsText: "My Moment is promoted", notification: true},
          { id: constants.USER_REPLIES_TO_MOMENT, settingsText: "My moment is commented", notification: true},
          { id: constants.USER_REPLIES_TO_COMMENT, settingsText: "My comment is replied to", notification: true}
      ];
    }
    var player_id = localStorageManager.get("OneSignal_PlayerID");
    var timeOfLastNotification = 0;

    var vm = this;
    vm.getLikesSinceLastNotification = getLikesSinceLastNotification;
    vm.notifyUser = notifyUser;
    vm.getPlayerId = getPlayerId;
    vm.setNotifications = setNotifications;
    vm.toggleNotification = toggleNotification
    vm.getNotificationStatus = getNotificationStatus;

    vm.notifyUploadToBestMoments = notifyUploadToBestMoments;
    vm.notifyMoreMomentsFound = notifyMoreMomentsFound;
    vm.notifyUserRepliesToMoment = notifyUserRepliesToMoment;
    vm.notifyUserRepliesToComment = notifyUserRepliesToComment;
    
    function getPlayerId() {
      return player_id;
    };

    function getNotificationStatus() {
      return notifications;
    };

    function getLikesSinceLastNotification(notification) {
      localStorageManager.get("OneSignal_Likes");
    };

    function isNotificationOn(notificationId) {
      for(var i = 0; i < notifications.length; i++) {
        if(notificationId === notifications[i].id) {
          return notifications[i].notification;
        }
      }
      return false;
    };

    function toggleNotification(id, toggle) {
      for(var i = 0; i < notifications.length; i++) {
          if(notifications[i].id === id) {
            notifications[i].notification = toggle;
          }
      }
      if(id === "ALL") {
        setNotifications(toggle);
      }
    };

    function setNotifications(bool) {
      window.plugins.OneSignal.setSubscription(bool);
    };

    function notifyUser(id, msg) {
        var currentTime = new Date().getTime();

        if(currentTime - timeOfLastNotification > constants.TIME_BETWEEN_NOTIFICATIONS) {
          var id = "42454774-4fe5-4fa7-8d25-d15d09211c2d"; //For Testing
          var notificationObj = { contents: {en: msg},
                                  include_player_ids: [id] };
          window.plugins.OneSignal.postNotification(notificationObj,
            function(successResponse) {
              console.log("Notification Post Success:", successResponse);
              timeOfLastNotification = currentTime;
            },
            function (failedResponse) {
              console.log("Notification Post Failed: ", failedResponse);
              // alert("Notification Post Failed:\n" + JSON.stringify(failedResponse));
            }
          );
        }
    };

    function notifyUploadToBestMoments(id) {
      if(isNotificationOn(constants.MOMENT_BECOMES_BEST_MOMENT)) {
        notifyUser(id, constants.MOMENT_BECOMES_BEST_MOMENT);
      }
    };

    function notifyMoreMomentsFound() {
      if(isNotificationOn(constants.MORE_MOMENTS_FOUND)) {
        notifyUser(player_id, constants.MORE_MOMENTS_FOUND);
      }
    }

    function notifyUserRepliesToMoment(id) {
      if(isNotificationOn(constants.USER_REPLIES_TO_MOMENT)) {
        notifyUser(id, constants.USER_REPLIES_TO_MOMENT);
      }
    };

    function notifyUserRepliesToComment(id) {
      if(isNotificationOn(constants.USER_REPLIES_TO_COMMENT)) {
        notifyUser(id, constants.USER_REPLIES_TO_COMMENT);
      }
    };

  };
})(); 