/* global isPWE */

'use strict';

// Element for the project list
var projectBox = $('#project-box'),
  projectList = $('#project-list');

// Hide projectBox if there is no project
if ($('#project-list>li').length === 0) {
  projectBox.hide();
}

$('.project-title').hover(function() {
  $(this.parentNode.parentNode).find('.project-image-overlay').show();
}, function() {
  $(this.parentNode.parentNode).find('.project-image-overlay').hide();
});

// Code for new project
$('#new-project').on('show.bs.modal', function() {
  // Dialog for the project type
  var projectTypeDlg = $('#project-type');

  // Dialog for the project format
  var projectFormatDlg = $('#project-format');

  // Dialog for the profile and version
  var profileVersionDlg = $('#profile-version');

  // Dialog for the template or sample
  var templateSampleDlg = $('#template-sample');

  // Dialog for the project properties
  var propertyDlg = $('#project-property');

  // Variable for the project
  var currentProcess = 'project-type',
    emptyProject = false,
    projectDescription = '',
    projectExtension = '',
    projectFormat = 'template',
    projectName = '',
    projectProfile = 'mobile',
    projectType = 'wasm',
    projectVersion = '4.0',
    templateName = '';

  // Button for the dialog
  var backBtn = $('#back-button'),
    crxBtn = $('#crx-button'),
    finishBtn = $('#finish-button'),
    iotBtn = $('#iot-button'),
    mobileBtn = $('#mobile-button'),
    nextBtn = $('#next-button'),
    sampleBtn = $('#sample-button'),
    sthingsBtn = $('#sthings-button'),
    templateBtn = $('#template-button'),
    tvBtn = $('#tv-button'),
    wasmBtn = $('#wasm-button'),
    wearableBtn = $('#wearable-button'),
    webBtn = $('#web-button');

  // Input element on the dialog
  var projectDescriptionInput = $('#project-description'),
    projectNameInput = $('#project-name');

  var mobileVersion = $('#mobile-version'),
    tvVersion = $('#tv-version'),
    wearableVersion = $('#wearable-version');

  // Handle buttons click event
  $('#project-format .btn').click(function ($event) {
    if ($('#project-format .btn.btn-primary') &&
      $('#project-format .btn.btn-primary').get(0) !== $event.currentTarget) {
      $('#project-format .btn.btn-primary').removeClass('btn-primary');
    }
    $($event.currentTarget).addClass('btn-primary');
  });

  templateBtn.click(function () {
    sampleBtn.removeClass('btn-primary');
    templateBtn.addClass('btn-primary');
  });

  sampleBtn.click(function () {
    templateBtn.removeClass('btn-primary');
    sampleBtn.addClass('btn-primary');
  });

  $('#project-type .btn').click(function ($event) {
    if ($('#project-type .btn.btn-primary') &&
      $('#project-type .btn.btn-primary').get(0) !== $event.currentTarget) {
      $('#project-type .btn.btn-primary').removeClass('btn-primary');
    }
    $($event.currentTarget).addClass('btn-primary');
  });

  $('#empty-checkbox').on('change', function() {
    emptyProject = this.checked;
    if (emptyProject) {
      templateBtn.attr('disabled', 'disabled');
      templateBtn.removeClass('btn-primary');
      sampleBtn.attr('disabled', 'disabled');
      sampleBtn.removeClass('btn-primary');
    } else {
      templateBtn.addClass('btn-primary');
      templateBtn.removeAttr('disabled');
      sampleBtn.removeAttr('disabled');
    }
  });

  $('#profile-version .btn').click(function ($event) {
    if ($('#profile-version .btn.btn-primary') &&
        $('#profile-version .btn.btn-primary').get(0) !== $event.currentTarget) {
      $('#profile-version .btn.btn-primary').removeClass('btn-primary');
    }
    $($event.currentTarget).addClass('btn-primary');
  });

  mobileBtn.click(function () {
    wearableBtn.removeClass('btn-primary');
    tvBtn.removeClass('btn-primary');
    mobileBtn.addClass('btn-primary');
  });

  wearableBtn.click(function () {
    mobileBtn.removeClass('btn-primary');
    tvBtn.removeClass('btn-primary');
    wearableBtn.addClass('btn-primary');
  });

  tvBtn.click(function () {
    mobileBtn.removeClass('btn-primary');
    wearableBtn.removeClass('btn-primary');
    tvBtn.addClass('btn-primary');
  });

  $('#mobile-version-dropdown>li').click(function() {
    var version = $(this).text();
    mobileVersion.text(version);
    projectVersion = version.split('v')[1];
  });

  $('#wearable-version-dropdown>li').click(function() {
    var version = $(this).text();
    wearableVersion.text(version);
    projectVersion = version.split('v')[1];
  });

  $('#tv-version-dropdown>li').click(function() {
    var version = $(this).text();
    tvVersion.text(version);
    projectVersion = version.split('v')[1];
  });

  // Init button state and value
  nextBtn.removeAttr('disabled');
  backBtn.attr('disabled', 'disabled');
  finishBtn.attr('disabled', 'disabled');
  projectNameInput.val('');
  projectDescriptionInput.val('');
  mobileVersion.text('Mobile');
  wearableVersion.text('Wearable');
  tvVersion.text('Tv');
  projectTypeDlg.show();
  projectFormatDlg.hide();
  profileVersionDlg.hide();
  templateSampleDlg.hide();
  propertyDlg.hide();
  mobileBtn.trigger('click');
  templateBtn.trigger('click');
  wasmBtn.trigger('click');
  $('#empty-checkbox')[0].checked = false;

  if (isPWE) {
    projectTypeDlg.hide();
    projectFormatDlg.show();
    currentProcess = 'project-format';
    projectType = 'pwe';
  }

  // Update the list of template or sample
  function updateTemplateSample(projectFormat, projectType, projectProfile) {
    $.post('/update/template', {
      format: projectFormat,
      type: projectType,
      profile: projectProfile
    }).done(function(data) {
      templateSampleDlg.html(data);

      $('a.list-group-item.category').click(function() {
        $('a.list-group-item.category').removeClass('active');
        $(this).addClass('active');

        var category = $(this).text().trim();

        $('a.list-group-item.template').each(function(index) {
          $(this).addClass('hidden');

          var value = $(this).find('.list-group-item-category').text().trim();
          if (value === category) {
            $(this).removeClass('hidden');
          }
        });
      });

      if ($('a.list-group-item.category').length > 0) {
        $($('a.list-group-item.category')[0]).addClass('active');

        var category = $($('a.list-group-item.category')[0]).text().trim();
        
        $('a.list-group-item.template').each(function(index, template){
          $(this).addClass('hidden');

          var value = $(this).find('.list-group-item-category').text().trim();
          if (value === category) {
            $(this).removeClass('hidden');
          }
        });
      }

      $('a.list-group-item.template').click(function() {
        $('a.list-group-item.template').removeClass('active');
        $(this).addClass('active');
        $(this).css('color', 'black');
        templateName = $(this).find('.list-group-item-src').text();
        var extension = $(this).find('.list-group-item-extension').text().trim();
        if (extension.length !== 0) {
          projectExtension = extension;
        }
      });

      if ($('a.list-group-item.template').length === 0) {
        // Disable next button when there is no template or sample
        nextBtn.attr('disabled', 'disabled');
      }
    });
  }

  nextBtn.click(function() {
    switch (currentProcess) {
    case 'project-type':
      // Save selected application type
      if (wasmBtn.hasClass('btn-primary')) {
        projectType = 'wasm';
      } else if (webBtn.hasClass('btn-primary')) {
        projectType = 'web';
      } else if (iotBtn.hasClass('btn-primary')) {
        projectType = 'iotjs';
      } else if (sthingsBtn.hasClass('btn-primary')) {
        projectType = 'sthings';
      } else if (crxBtn.hasClass('btn-primary')) {
        projectType = 'crx';
      }

      projectTypeDlg.hide();
      projectFormatDlg.show();
      backBtn.removeAttr('disabled');
      currentProcess = 'project-format';

      break;
    case 'project-format':
      // Hide current dialog and then show next dialog
      projectFormatDlg.hide();

      // Save selected project type
      if (templateBtn.hasClass('btn-primary')) {
        projectFormat = 'template';
      } else if (sampleBtn.hasClass('btn-primary')) {
        projectFormat = 'sample';
      }

      if (projectType === 'web' || projectType === 'sthings') {
        profileVersionDlg.show();
        currentProcess = 'profile-version';
      } else {
        if (projectType === 'pwe') {
          backBtn.removeAttr('disabled');
        }

        if (emptyProject) {
          propertyDlg.show();
          nextBtn.attr('disabled', 'disabled');
          currentProcess = 'project-property';
        } else {
          // Skip profile-version on WASM Module
          updateTemplateSample(projectFormat, projectType);
          templateSampleDlg.show();
          currentProcess = 'template-sample';
        }
      }

      break;
    case 'profile-version':
      profileVersionDlg.hide();

      if (mobileBtn.hasClass('btn-primary')) {
        projectProfile = 'mobile';
      } else if (wearableBtn.hasClass('btn-primary')) {
        projectProfile = 'wearable';
      } else if (tvBtn.hasClass('btn-primary')) {
        projectProfile = 'tv';
      }

      if (emptyProject) {
        propertyDlg.show();
        nextBtn.attr('disabled', 'disabled');
        currentProcess = 'project-property';
      } else {
        updateTemplateSample(projectFormat, projectType, projectProfile);
        templateSampleDlg.show();
        currentProcess = 'template-sample';
      }
      break;
    case 'template-sample':
      templateSampleDlg.hide();
      propertyDlg.show();
      nextBtn.attr('disabled', 'disabled');
      currentProcess = 'project-property';

      break;
    }
  });

  backBtn.click(function() {
    switch (currentProcess) {
    case 'project-format':
      projectFormatDlg.hide();
      projectTypeDlg.show();
      backBtn.attr('disabled', 'disabled');
      currentProcess = 'project-type';
      break;
    case 'profile-version':
      profileVersionDlg.hide();
      projectFormatDlg.show();
      currentProcess = 'project-format';
      break;
    case 'template-sample':
      nextBtn.removeAttr('disabled');
      if (projectType === 'web' || projectType === 'sthings') {
        templateSampleDlg.hide();
        profileVersionDlg.show();
        currentProcess = 'profile-version';
      } else {
        if (projectType === 'pwe') {
          backBtn.attr('disabled', 'disabled');
        }

        templateSampleDlg.hide();
        projectFormatDlg.show();
        currentProcess = 'project-format';
      }
      break;
    case 'project-property':
      propertyDlg.hide();
      nextBtn.removeAttr('disabled');
      finishBtn.attr('disabled', 'disabled');
      projectNameInput.val('');
      projectDescriptionInput.val('');

      if (emptyProject) {
        if (projectType === 'web') {
          profileVersionDlg.show();
          currentProcess = 'profile-version';
        } else {
          projectFormatDlg.show();
          currentProcess = 'project-format';
        }
      } else {
        templateSampleDlg.show();
        currentProcess = 'template-sample';
      }
      break;
    }
  });

  projectNameInput.keyup(function() {
    if (projectNameInput.val().length > 0) {
      finishBtn.removeAttr('disabled');
    } else {
      finishBtn.attr('disabled', 'disabled');
    }
  });

  finishBtn.click(function() {
    projectName = projectNameInput.val();
    projectDescription = projectDescriptionInput.val();

    // Check only project name whether it is empty or not
    if (projectName === '') {
      window.alert('You must specify the project name');
      return;
    }

    $.ajax({
      url: '/project',
      type: 'put',
      data: {
        name: projectName,
        description: projectDescription,
        format: projectFormat,
        profile: projectProfile,
        version: projectVersion,
        type: projectType,
        templateName: templateName.trim(),
        extension : projectExtension
      }
    }).done(function() {
      $.get('/update').done(function(data) {
        projectList.html(data);
        projectBox.show();
        $('#new-project').modal('hide');
      });
    }).fail(function(err) {
      if (err.responseText !== '') {
        alert('Error:' + err.responseText);
      }
      console.error(err);
    });
  });
});

// Unbind the event listeners for the new project
$('#new-project').on('hide.bs.modal', function() {
  $('#back-button').off();
  $('#cancel-button').off();
  $('#empty-checkbox').off();
  $('#finish-button').off();
  $('#iot-button').off();
  $('#mobile-button').off();
  $('#mobile-version-dropdown>li').off();
  $('#next-button').off();
  $('#project-name').off();
  $('#sample-button').off();
  $('#sthings-button').off();
  $('#template-button').off();
  $('#template-list>li').off();
  $('#tv-button').off();
  $('#tv-version-dropdown>li').off();
  $('#wasm-button').off();
  $('#wearable-button').off();
  $('#wearable-version-dropdown>li').off();
  $('#web-button').off();
  $('#crx-button').off();
});

// Code for delete project
$('#delete-project').on('show.bs.modal', function(evt) {
  var button = $(evt.relatedTarget);
  var id = button.data('whatever');

  $('#delete-button').on('click', function() {
    $.ajax({
      url: '/project/' + id,
      type: 'delete'
    }).done(function() {
      $.get('/update').done(function(data) {
        projectList.html(data);

        if (data.trim() === '') {
          projectBox.hide();
        }

        $('#delete-project').modal('hide');
      });
    }).fail(function(err) {
      $('#delete-project').modal('hide');
      console.error(err);
      window.alert(err.responseText);
    });
  });
});

// Unbind the event listeners for the delete project
$('#delete-project').on('hide.bs.modal', function() {
  $('#delete-button').off();
});

// Code for import project
$('#import-project').on('show.bs.modal', function() {
  var currentTab = 'file',
    file;

  var backBtn = $('#import-back-button'),
    fileTab = $('#import-file-tab'),
    finishBtn = $('#import-button'),
    importFile = $('#import-file'),
    importFileInput = $('#import-file-input'),
    nextBtn = $('#import-next-button'),
    projectDescriptionInput = $('#import-project-description'),
    projectNameInput = $('#import-project-name'),
    propertyPanel = $('#import-project-property'),
    selectPanel = $('#select-file-url'),
    urlTab = $('#import-url-tab');

  $('#import-tabs>li').click(function(evt) {
    $('#import-tabs>li').removeClass('active');
    $(this).addClass('active');

    if (evt.target.id === 'import-file-button') {
      urlTab.hide();
      fileTab.show();
      currentTab = 'file';
    } else {
      fileTab.hide();
      urlTab.show();
      currentTab = 'url';
    }
  });

  $('#import-file').on('change', function(evt) {
    var files = evt.target.files;

    if (!files.length) {
      importFileInput.val('');
      return;
    }

    file = files[0];
    var fileExtension = file.name.split('.').pop();

    if (fileExtension === 'zip' || fileExtension === 'wgt') {
      importFileInput.val(file.name);
    } else {
      file = undefined;
      window.alert('You can only select zip/wgt!');
      return;
    }
  });

  nextBtn.click(function() {
    if (!file) {
      window.alert('You have to select file!');
      return;
    }

    selectPanel.hide();
    propertyPanel.show();

    nextBtn.attr('disabled', 'disabled');
    backBtn.removeAttr('disabled');

    projectNameInput.keyup(function() {
      if (projectNameInput.val().length > 0) {
        finishBtn.removeAttr('disabled');
      } else {
        finishBtn.attr('disabled', 'disabled');
      }
    });
    importFile.val('');
  });

  backBtn.click(function() {
    propertyPanel.hide();
    selectPanel.show();

    backBtn.attr('disabled', 'disabled');
    nextBtn.removeAttr('disabled');
  });

  finishBtn.click(function() {
    var projectName = projectNameInput.val();
    var projectDescription = projectDescriptionInput.val();

    // Show progress dialog
    $('#progress-dialog').modal('show');

    if (currentTab === 'file') {
      var formData = new FormData();
      formData.append('uploads[]', file, file.name);

      $.ajax({
        url: '/import/archive',
        type: 'put',
        data: {
          name: projectName,
          filename: file.name,
          description: projectDescription
        }
      }).done(function(projectId) {
        $.ajax({
          url: '/import/archive/upload/'+projectId,
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(){
            $('#progress-dialog').modal('hide');
            $.get('/update').done(function(data) {
              projectList.html(data);
              projectBox.show();
              $('#import-project').modal('hide');
            });
          },
          error: function(err) {
            $('#progress-dialog').modal('hide');
            console.error(err);
            window.alert(err.responseText);
          },
          xhr: function() {
            // create an XMLHttpRequest
            var xhr = new XMLHttpRequest();

            // listen to the 'progress' event
            xhr.upload.addEventListener('progress', function(evt) {
              if (evt.lengthComputable) {
                // calculate the percentage of upload completed
                var percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);

                // update the Bootstrap progress bar with the new percentage
                $('.progress-bar').text(percentComplete + '%');
                $('.progress-bar').width(percentComplete + '%');

                // once the upload reaches 100%, set the progress bar text to done
                if (percentComplete === 100) {
                  $('.progress-bar').html('Done');
                }
              }
            }, false);

            return xhr;
          }
        });
      }).fail(function(err) {
        if (err) {
          $('#progress-dialog').modal('hide');
          console.error(err);
          window.alert(err.responseText);
        }
      });
    } else {
      // currentTab === 'url'
      // WIP...
    }
  });

  // Init button state and value
  $('#import-tabs>li').removeClass('active');
  $($('#import-tabs>li')[0]).addClass('active');
  urlTab.hide();
  fileTab.show();
  propertyPanel.hide();
  selectPanel.show();
  backBtn.attr('disabled', 'disabled');
  nextBtn.removeAttr('disabled');
  projectNameInput.val('');
  projectDescriptionInput.val('');
  importFileInput.val('');
  importFile.val('');
});

// Unbind the event listeners for the import project
$('#import-project').on('hide.bs.modal', function() {
  $('#import-tabs>li').off();
  $('#import-file').off();
  $('#import-cancel-button').off();
  $('#import-button').off();
  $('#import-next-button').off();
  $('#import-back-button').off();
  $('#import-project-name').off();
});

// Code for edit project
$('#edit-project').on('show.bs.modal', function(event) {
  var projectId = $(event.relatedTarget).data('whatever');

  $.get('/project/'+projectId).done(function(data) {
    $('#edit-project-name').val(data.name);
    $('#edit-project-description').val(data.description);
    $('#edit-project-type').text(data.type);
    if (data.type === 'web') {
      $('#edit-profile').text(data.profile);
      $('#edit-version').text(data.version);
      $('#edit-project-profile').show();
      $('#edit-project-version').show();
    }
  });

  $('#edit-project-type-dropdown>li').click(function() {
    $('#edit-project-type').text($(this).text());

    if ($(this).text() === 'web') {
      $('#edit-project-profile').show();
      $('#edit-project-version').show();
    } else {
      $('#edit-project-profile').hide();
      $('#edit-project-version').hide();
    }
  });

  $('#edit-profile-dropdown>li').click(function() {
    $('#edit-profile').text($(this).text());
  });

  $('#edit-version-dropdown>li').click(function() {
    $('#edit-version').text($(this).text());
  });

  $('#edit-save-button').click(function() {
    var projectType = $('#edit-project-type').text();
    var projectProfile = '';
    var projectVersion = '';
    
    if (projectType === 'web') {
      projectProfile = $('#edit-profile').text();
      projectVersion = $('#edit-version').text();
    }

    $.post('/project/'+projectId, {
      name: $('#edit-project-name').val(),
      description: $('#edit-project-description').val(),
      type: projectType,
      profile: projectProfile,
      version: projectVersion,
    }).done(function() {
      $.get('/update').done(function(data) {
        projectList.html(data);
        $('#edit-project').modal('hide');
      });
    }).fail(function(error) {
      if (error) {
        console.error(error);
      }
    });
  });
});

// Unbind the event listeners for the edit project
$('#edit-project').on('hide.bs.modal', function() {
  $('#edit-project-profile').hide();
  $('#edit-project-version').hide();
  $('#edit-save-button').off();
  $('#edit-profile-dropdown>li').off();
  $('#edit-version-dropdown>li').off();
});

// Code for export project
$('#export-project').on('show.bs.modal', function(event) {
  var projectId = $(event.relatedTarget).data('whatever');
  var target;
  var shareUrl;

  $.get('/project/' + projectId).done(function(data) {
    var type = data.type;

    var lists = $('#export-list>li');
    for (var i=0; i<lists.length; i++) {
      var list = lists[i];
      if (list.type === type || list.type === 'all') {
        $(list).show();
      } else {
        $(list).hide();
      }
    }

    $('#export-list>li').click(function() {
      $('#export-list>li').removeClass('btn-primary active');
      $(this).addClass('btn-primary active');
      target = $(this).text().trim().toLowerCase();
    });

    $('#export-button').click(function() {
      if (target === 'web') {
        $.post('/export/web',
          { projectId: projectId }
        ).done(function(data) {
          $('#export-project').modal('hide');
          $('#share-project').modal('show');
          shareUrl = [location.origin,'temp',data].join('/');
          $('#share-url').val(shareUrl);
        }).fail(function(error) {
          console.error(error);
        });
      } else if (target === 'share') {
        $.post('/export/share', {
          projectId: projectId,
          projectName: data.name
        }).done(function() {
          $('#export-project').modal('hide');
        }).fail(function(error) {
          console.error(error);
        });
      } else if (target === 'tizen') {
        $.get('/export/tizen/'+projectId).done(function(data) {
          var anchor = document.createElement('a');
          var wgtPath = [window.location.origin, data.path].join('/');
          anchor.href = wgtPath;
          anchor.download = data.name;
          anchor.click();
          $('#export-project').modal('hide');
        }).fail(function() {
          window.alert('Not found wgt file');
        });
      }
    });
  });
});

$('#export-project').on('hide.bs.modal', function() {
  $('#export-list>li').removeClass('btn-primary active');
  $('#export-list>li').off();
  $('#export-button').off();
});

$('#share-project').on('show.bs.modal', function() {
  $('#share-copy-button').click(function() {
    $('#share-url').select();
    document.execCommand('copy');
  });

  $('#share-open-button').click(function() {
    window.open($('#share-url').val());
  });
});

$('#share-project').on('hide.bs.modal', function() {
  $('#share-url').val('');
  $('#share-copy-button').off();
  $('#share-open-button').off();
});
