import * as _ from 'lodash';

export const shareProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { platform } = req.query;

    const deeplink = `thryffy://product/${productId}`;

    const timeout = _.toLower(platform) === 'ios' ? 3000 : 1000;

    const downloadLink = _.cond([
      [
        _.curry(_.eq)('android'),
        _.constant('https://play.google.com/store/apps/details?id=com.thryffy')
      ],
      [
        _.curry(_.eq)('ios'),
        _.constant('https://apps.apple.com/my/app/thryffy-buy-sell-clothes/id1538541364')
      ]
    ])(_.toLower(platform));

    const script = `
        <script>
          window.location.href = "${deeplink}";
          setTimeout(function() {
            window.location.href = "${downloadLink}";
          }, ${timeout});
        </script>
      `;

    return res.send(script);
  } catch (e) {
    return next(e);
  }
};

export const shareProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { platform } = req.query;
    const deeplink = `thryffy://users/${userId}`;
    const timeout = _.toLower(platform) === 'ios' ? 3000 : 1000;

    const downloadLink = _.cond([
      [
        _.curry(_.eq)('android'),
        _.constant('https://play.google.com/store/apps/details?id=com.thryffy')
      ],
      [
        _.curry(_.eq)('ios'),
        _.constant('https://apps.apple.com/my/app/thryffy-buy-sell-clothes/id1538541364')
      ]
    ])(_.toLower(platform));

    const script = `
        <script>
          window.location.href = "${deeplink}";
          setTimeout(function() {
            window.location.href = "${downloadLink}";
          }, ${timeout});
        </script>
      `;

    return res.send(script);
  } catch (e) {
    return next(e);
  }
};
