import wkhtmltopdf from 'wkhtmltopdf';

export const generatePDF = (htmlString, config) => {
  const stream = wkhtmltopdf(htmlString, {
    disableSmartShrinking: true,
    printMediaType: true,
    pageSize: 'a4',
    ...config
  });
  return stream;
};

export const downloadStream = (res, stream, filename) => {
  res.header('Content-Disposition', `attachment; filename="${filename}"`);
  stream.pipe(res);
};
