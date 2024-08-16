import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';

import { appHost } from 'components/apphost';
import { supportsLocalization } from 'utils/datetime';
import globalize from 'scripts/globalize';
import { DATE_LOCALE_OPTIONS, LANGUAGE_OPTIONS } from './constants';
import { DisplaySettingsValues } from './types';

interface LocalizationPreferencesProps {
    onChange: (event: SelectChangeEvent) => void;
    values: DisplaySettingsValues;
}

export function LocalizationPreferences({ onChange, values }: Readonly<LocalizationPreferencesProps>) {
    if (!appHost.supports('displaylanguage') && !supportsLocalization()) {
        return null;
    }
    return (
        <Stack spacing={3}>
            <Typography variant='h2'>{globalize.translate('Localization')}</Typography>

            { appHost.supports('displaylanguage') && (
                <FormControl fullWidth>
                    <InputLabel id='display-settings-language-label'>{globalize.translate('LabelDisplayLanguage')}</InputLabel>
                    <Select
                        aria-describedby='display-settings-language-description'
                        inputProps={{
                            name: 'language'
                        }}
                        labelId='display-settings-language-label'
                        onChange={onChange}
                        value={values.language}
                    >
                        { ...LANGUAGE_OPTIONS.map(({ value, label }) => (
                            <MenuItem key={value } value={value}>{ label }</MenuItem>
                        ))}
                    </Select>
                    <FormHelperText component={Stack} id='display-settings-language-description'>
                        <span>{globalize.translate('LabelDisplayLanguageHelp')}</span>
                        { appHost.supports('externallinks') && (
                            <Link
                                href='https://github.com/jellyfin/jellyfin'
                                rel='noopener noreferrer'
                                target='_blank'
                            >
                                {globalize.translate('LearnHowYouCanContribute')}
                            </Link>
                        ) }
                    </FormHelperText>
                </FormControl>
            ) }

            { supportsLocalization() && (
                <FormControl fullWidth>
                    <InputLabel id='display-settings-locale-label'>{globalize.translate('LabelDateTimeLocale')}</InputLabel>
                    <Select
                        inputProps={{
                            name: 'dateTimeLocale'
                        }}
                        labelId='display-settings-locale-label'
                        onChange={onChange}
                        value={values.dateTimeLocale}
                    >
                        {...DATE_LOCALE_OPTIONS.map(({ value, label }) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) }
        </Stack>
    );
}
