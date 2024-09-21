import React, { FC } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Typography } from '@mui/material';
import globalize from 'lib/globalize';
import type { TextAction } from '../../types/TextAction';

interface GroupItemLinksProps {
    label: string;
    text?: string;
    textActions?: TextAction[];
}

const GroupItemLinks: FC<GroupItemLinksProps> = ({
    label,
    text,
    textActions
}) => {
    if (text || textActions?.length) {
        return (
            <div className='detailsGroupItem '>
                <div className='label'>{globalize.translate(label)}</div>
                {text ? (
                    <Typography component={'span'}>{text}</Typography>
                ) : (
                    <Breadcrumbs
                        aria-label='breadcrumb'
                        className='content'
                        itemsBeforeCollapse={5}
                    >
                        {textActions?.map((val) => (
                            <Link
                                key={val.title}
                                underline='hover'
                                color='inherit'
                                href={val.href}
                                rel={val.rel}
                                target={val.target}
                            >
                                {val.title}
                            </Link>
                        ))}
                    </Breadcrumbs>
                )}
            </div>
        );
    }
};

export default GroupItemLinks;
