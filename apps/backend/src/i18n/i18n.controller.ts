import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { Locale } from '@swissfarm/types';
import { SUPPORTED_LOCALES, getTranslations, LOCALE_LABELS } from './translations';
import { Public } from '../libs/decorators/public.decorator';

@Controller('i18n')
export class I18nController {
  @Public()
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
  @Public()
  @Get()
  getLocales() {
    return SUPPORTED_LOCALES.map((locale) => ({
      code: locale,
      label: LOCALE_LABELS[locale],
    }));
  }
}