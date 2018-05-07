jQuery(document).ready(function () {
  if (Notification.permission !== "granted") Notification.requestPermission();
  var isMinimized = true;

  jQuery(document).ready(function () {
      // initial chats
      var userID = null,
          userName = null,
          newUser = false,
          ls = JSON.parse(localStorage.getItem('qismo-data'))

      if (ls === null && userID === null) {
          var chatForm = jQuery('<div class="cs-chat-container">' +
              '<div class="cs-chat-wrapper">' +
              '<span class="cs-close-chat">&#x268A;</span>' +
              '<div class="box-form">' +
              '<h3>' + window.qismoWelcomeText + '</h3>' +
              '<p>Please fill the details below before chatting with us</p>' +
              '<form>' +
              '<div class="form-group">' +
              '<input type="name" name="name" class="form-field" id="inputname" placeholder="Name">' +
              '</div>' +
              '<div class="form-group">' +
              '<input type="email" name="email" class="form-field" id="inputEmail" placeholder="Email">' +
              '</div>' +
              '<div class="form-group">' +
              '<button name="submitform" type="submit" class="cs-submit-form">Submit</button>' +
              '</div>' +
              '</form>' +
              '</div>' +
              '</div>' +
              '<button type="button" class="cs-trigger-button">Talk To Us</button>' +
              '</div>')
          chatForm.prependTo('body')

          jQuery('.cs-chat-wrapper form').on('submit', function (e) {
              e.preventDefault();
              var _self = jQuery(this),
                  submitBtn = jQuery('button[name="submitform"]'),
                  randomKey = Date.now(),
                  userData = {
                      user_id: jQuery('#inputEmail').val(),
                      user_name: jQuery('#inputname').val()
                  }

              if (!userData.user_id || !userData.user_name) {
                  if (jQuery('.form-group.error').length === 0) {
                      jQuery('<div class="form-group error"><span>All fields are required!</span></div>').prependTo(_self);
                  }
                  return
              } else {
                  jQuery('.form-group.error').remove();
              }
              submitBtn.attr('type', 'button')
              submitBtn.prop('disabled', '')
              submitBtn.html('Loading...')
              newUser = true
              localStorage.setItem('qismo-data', JSON.stringify(userData))
              initQiscusWidget(userData.user_id, userData.user_name, userData.user_name, newUser)
          })
      } else {
          userID = ls.user_id
          userName = ls.user_name
          initQiscusWidget(userID, userName, userName, newUser)
      }

      function initQiscusWidget(userID, userName, roomName, newUser) {
          var baseURL = 'https://qismo.qiscus.com',
              appId = window.qismoAppId,
              userId = userID,
              avatar = 'https://d1edrlpyc25xu0.cloudfront.net/kiwari-prod/image/upload/wMWsDZP6ta/1516689726-ic_qiscus_client.png'

          // Initiate Room
          var initRoom = jQuery.post(`${baseURL}/api/v1/qiscus/initiate_chat`,
              {
                  'app_id': appId,
                  'user_id': userId,
                  'name': roomName,
                  'avatar': avatar
              }
          );

          initRoom.done(function (data) {
              jQuery('.cs-chat-container').removeClass('--open')
              jQuery('.cs-chat-container').remove()
              
              window.roomId = data.data.room_id
              var password = data.data.sdk_user.password,
                  sdkEmail = data.data.sdk_user.email

              if (newUser) {
                  QiscusSDK.core.init({
                      AppId: appId,
                      options: {
                          loginSuccessCallback: function (userData) {
                              QiscusSDK.core.UI.chatGroup(window.roomId)
                          },
                          roomChangedCallback(data) {
                              qiscus.selected.name = window.CustomerServiceName || "Customer Service"
                              qiscus.selected.avatar = window.CustomerServiceAvatar || "https://d1edrlpyc25xu0.cloudfront.net/kiwari-prod/image/upload/q5sred_vy0/1516689209-ic_qiscus_user.png"
                          },
                          newMessagesCallback(data) {
                              showNotif(data);
                              // scrolling to bottom
                              setTimeout(function () {
                                  lastCommentId = QiscusSDK.core.selected.comments[QiscusSDK.core.selected.comments.length - 1].id;
                                  theElement = document.getElementById(lastCommentId);
                                  theElement.scrollIntoView({ block: 'end', behaviour: 'smooth' })
                              }, 200);
                          }
                      }
                  })
              } else {
                  QiscusSDK.core.init({
                      AppId: appId,
                      options: {
                          roomChangedCallback(data) {
                              qiscus.selected.name = window.CustomerServiceName || "Customer Service"
                              qiscus.selected.avatar = window.CustomerServiceAvatar || "https://d1edrlpyc25xu0.cloudfront.net/kiwari-prod/image/upload/q5sred_vy0/1516689209-ic_qiscus_user.png"
                          },
                          newMessagesCallback(data) {
                              showNotif(data);
                              setTimeout(function () {
                                  lastCommentId = QiscusSDK.core.selected.comments[QiscusSDK.core.selected.comments.length - 1].id;
                                  theElement = document.getElementById(lastCommentId);
                                  theElement.scrollIntoView({ block: 'end', behaviour: 'smooth' })
                              }, 200);
                          }
                      }
                  })
              }

              QiscusSDK.core.setUser(sdkEmail, password, userName)
              QiscusSDK.render()
              QiscusSDK.core.UI.widgetButtonText = window.qismoWidgetButtonText
          });
      }
  });
  jQuery(function () {
      // button form live chat
      if (screen.width > 768) {
          jQuery('body').on('click', '.cs-trigger-button, .cs-close-chat', function () {
              if (jQuery('.--open').length > 0) {
                  jQuery('.cs-chat-container').removeClass('--open')
              } else {
                  jQuery('.cs-chat-container').addClass('--open')
              }
          })
      } else {
          jQuery('body').on('click', '.cs-trigger-button, .cs-close-chat', function () {
              if (jQuery('.--open').length > 0) {
                  jQuery('.cs-chat-container').removeClass('--open')
                  jQuery('body').removeClass('--modalOpen')
                  document.ontouchmove = function (event) {

                  }
              } else {
                  jQuery('.cs-chat-container').addClass('--open')
                  jQuery('body').addClass('--modalOpen')
                  document.ontouchmove = function (event) {
                      event.preventDefault();
                  }
              }
          })
      }

      // button live chat sdk
      jQuery('body').on('click', '.qcw-trigger-btn', function () {
          if (isMinimized && !qiscus.selected) {
              QiscusSDK.core.UI.chatGroup(window.roomId)
          }
          isMinimized = !isMinimized;
      })
  })
  function showNotif(data) {
      // create the notification if only window is not focused
      if (document.hasFocus()) return

      if (data[0].email === QiscusSDK.core.user_id
          && data[0].room_id == QiscusSDK.core.selected.id) return false;

      const notif = new Notification(`you get a chat from ${data[0].username}`, {
          icon: data[0].user_avatar,
          body: (data[0].message.startsWith('[file]'))
              ? 'File attached.'
              : data[0].message,
      });
      notif.onclick = function () {
          notif.close();
          window.focus();
      }
  }
});