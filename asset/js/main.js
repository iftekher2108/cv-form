 $(function () {

      const panels = $('.panel');
      const stepItems = $('.steps li');
      const nextBtn = $('#nextBtn');
      const backBtn = $('#backBtn');
      const form = $('#cvForm');
      const successView = $('#successView');
      let current = 1;
      const total = panels.length;

      const fieldsByStep = {
        1: ['fname', 'lname', 'dob'],
        2: ['present', 'permanent', 'city', 'state', 'postcode'],
        3: ['phone', 'email'],
        4: ['resume']
      };

      function updateRail() {
        stepItems.each(function () {
          const n = Number($(this).data('step'));
          $(this).removeClass('active done');
          if (n === current) $(this).addClass('active');
          else if (n < current) $(this).addClass('done');
        });
      }

      function showPanel(n) {
        panels.removeClass('active').filter('[data-panel="' + n + '"]').addClass('active');
        backBtn.prop('disabled', n === 1);
        nextBtn.text(n === total ? 'Submit application' : 'Continue');
        updateRail();
      }

      function validateField(id) {
        const $el = $('#' + id);
        if (!$el.length) return false;

        const $field = $el.closest('.field');
        let ok = id === 'resume' ? !!($el[0].files && $el[0].files.length) : $el[0].checkValidity();

        if (id === 'resume') {
          $('#resumeError').toggle(!ok);
          return ok;
        }

        $field.toggleClass('invalid', !ok);
        return ok;
      }

      function validateStep(n) {
        return fieldsByStep[n].every(validateField);
      }

      function buildSummary() {
        const $dl = $('#summary');
        const rows = [
          ['Name', `${val('fname')} ${val('lname')}`],
          ['Date of birth', val('dob')],
          ['Present address', val('present')],
          ['Permanent address', val('permanent')],
          ['City / State', `${val('city')}, ${val('state')} ${val('postcode')}`],
          ['Phone', val('phone')],
          ['Email', val('email')]
        ];

        $dl.html(rows.map(([k, v]) => `<div class="summary-row"><dt>${k}</dt><dd>${v || '—'}</dd></div>`).join(''));
      }

      function val(id) {
        return $('#' + id).val() || '';
      }

      nextBtn.on('click', function () {
        if (!validateStep(current)) return;

        if (current === total) {
          submitForm();
          return;
        }

        current += 1;
        if (current === total) buildSummary();
        showPanel(current);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      backBtn.on('click', function () {
        if (current === 1) return;
        current -= 1;
        showPanel(current);
      });

      stepItems.on('click', function () {
        const n = Number($(this).data('step'));
        if (n < current) {
          current = n;
          showPanel(current);
        }
      });

      const $sameAddr = $('#sameAddr');
      const $present = $('#present');
      const $permanent = $('#permanent');

      $sameAddr.on('change', function () {
        if (this.checked) {
          $permanent.val($present.val());
          $permanent.prop('disabled', true);
        } else {
          $permanent.prop('disabled', false);
        }
      });

      $present.on('input', function () {
        if ($sameAddr.is(':checked')) {
          $permanent.val($present.val());
        }
      });

      const $dropzone = $('#dropzone');
      const $resumeInput = $('#resume');
      const $fileChip = $('#fileChip');
      const $fileName = $('#fileName');
      const $fileSize = $('#fileSize');
      const $fileRemove = $('#fileRemove');

      $dropzone.on('click', function () {
        $resumeInput.trigger('click');
      });

      ['dragenter', 'dragover'].forEach(evt => {
        $dropzone.on(evt, function (e) {
          e.preventDefault();
          $dropzone.addClass('drag');
        });
      });

      ['dragleave', 'drop'].forEach(evt => {
        $dropzone.on(evt, function (e) {
          e.preventDefault();
          $dropzone.removeClass('drag');
        });
      });

      $dropzone.on('drop', function (e) {
        const f = e.originalEvent.dataTransfer.files[0];
        if (f) {
          $resumeInput[0].files = e.originalEvent.dataTransfer.files;
          showFile(f);
        }
      });

      $resumeInput.on('change', function () {
        const f = this.files[0];
        if (f) showFile(f);
      });

      function showFile(f) {
        $fileName.text(f.name);
        $fileSize.text((f.size / 1024 / 1024 < 1) ? Math.ceil(f.size / 1024) + ' KB' : (f.size / 1024 / 1024).toFixed(1) + ' MB');
        $fileChip.addClass('show');
        $('#resumeError').hide();
      }

      $fileRemove.on('click', function () {
        $resumeInput.val('');
        $fileChip.removeClass('show');
      });

      function submitForm() {
        const ref = 'CV-' + Date.now().toString().slice(-8);
        $('#refTag').text('Reference — ' + ref);
        form.hide();
        successView.addClass('active');
      }

      showPanel(current);
    });