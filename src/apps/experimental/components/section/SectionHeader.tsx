import React, { type FC } from 'react';
import classNames from 'classnames';
import LinkButton from 'elements/emby-button/LinkButton';

export interface SectionHeaderProps {
    className?: string;
    itemsLength?: number;
    url?: string;
    title: string;
}

const SectionHeader: FC<SectionHeaderProps> = ({
    title,
    className,
    itemsLength = 0,
    url

}) => {
    const sectionHeaderClass = classNames(
        'sectionTitleContainer sectionTitleContainer-cards',
        'padded-left',
        className
    );

    return (
        <div className={sectionHeaderClass}>
            {url && itemsLength > 5 ? (
                <LinkButton
                    className='clearLink button-flat sectionTitleTextButton'
                    href={url}
                >
                    <h2 className='sectionTitle sectionTitle-cards'>
                        {title}
                    </h2>
                    <span
                        className='material-icons chevron_right'
                        aria-hidden='true'
                    />
                </LinkButton>
            ) : (
                <h2 className='sectionTitle sectionTitle-cards'>
                    {title}
                </h2>
            )}
        </div>
    );
};

export default SectionHeader;
