import { IsIn, IsString } from 'class-validator';

export default class SearchCategoryDto {
  @IsString()
  @IsIn(['true', 'false', 'all'])
  readonly expired?: string = 'false';
}
