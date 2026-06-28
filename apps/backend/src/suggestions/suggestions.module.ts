import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsMobileController } from './suggestions-mobile.controller';
import { SuggestionsAdminController } from './suggestions-admin.controller';

@Module({
  imports: [],
  controllers: [SuggestionsMobileController, SuggestionsAdminController],
  providers: [SuggestionsService],
})
export class SuggestionsModule {}