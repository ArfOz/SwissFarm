import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { SUPPORTED_LOCALES, getTranslations, LOCALE_LABELS, Locale } from './translations';

@Controller('i18n')
export class I18nController {
  /**
   * GET /i18n/:locale
   * Returns all translations for the given locale (en, de, fr).
   * Used by admin panel and mobile app.
   */
  @Get(':locale')
  getTranslations(@Param('locale') locale: string) {
    if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
      throw new BadRequestException(
        `Unsupported locale "${locale}". Supported: ${SUPPORTED_LOCALES.join(', ')}`,
      );
    }
    return getTranslations(locale as Locale);
  }

  /**
   * GET /i18n
   * Returns list of supported locales with labels.
   */
  @Get()
  getLocales() {
    return SUPPORTED_LOCALES.map((locale) => ({
      code: locale,
      label: LOCALE_LABELS[locale],
    }));
  }
}