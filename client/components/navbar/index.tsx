import * as React from 'react';
import { FormSearchBox } from '../form/searchBox';
import Link from 'next/link';

//* Style import
import { NavbarContainer, NavbarBrand, NavbarLeft, NavbarBtnMobile } from './style';
import { BtnLink } from '../button';
import { ImageFull } from '../../style/common';
import Image from 'next/image';

export interface NavbarProps {}

export const Navbar: React.FunctionComponent<NavbarProps> = () => {
        const [active, setActive] = React.useState(true);

        return (
                <NavbarContainer $alignItems="center" $justifyContent="space-between">
                        <Link href="/">
                                <NavbarBrand>
                                        <Image src="/asset/icon/nav-logo.svg" alt="" height="32" width="120" />
                                </NavbarBrand>
                        </Link>
                        <NavbarLeft>
                                <FormSearchBox placeholder="Search" />

                                <BtnLink label="Login" link="/user/login" />
                                <BtnLink label="Register" link="/user/register" />
                        </NavbarLeft>
                        <NavbarBtnMobile onClick={() => setActive(!active)} className={active ? 'active' : ''}>
                                <div />
                                <div />
                                <div />
                        </NavbarBtnMobile>
                </NavbarContainer>
        );
};
