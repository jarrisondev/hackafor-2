import 'atropos/css';

import { FC, RefObject, useRef } from 'react';
import { Variant } from '@common';
import { Button } from '@components';
import { useUserStore } from '@store';
import { uploadTicket } from '@utils';
import { Atropos } from 'atropos/react';
import { toBlob, toPng } from 'html-to-image';
import { toast } from 'sonner';

interface TicketProps {
  avatar?: string;
  name?: string;
  number?: number;
}

const sponsors = [
  {
    name: 'Afordin',
    logo: '/images/sponsors/afordin_logo.webp'
  }
];

const downloadTicket = async (elementRef: RefObject<HTMLElement>, ticketId: string | null, providerId: string | null) => {
  if (elementRef.current && ticketId && providerId) {
    try {
      const dataUrl = await toPng(elementRef.current);

      if (!dataUrl) {
        toast.error('Ooops! Ha habido un problema con la descarga');
        return;
      }

      const link = document.createElement('a');
      link.download = 'hackafor-ticket.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Could not capture image:', error);
    }
  }
};

const shareTwitter = async (element: HTMLElement, ticketId: string | null, providerId: string | null) => {
  if (element && ticketId && providerId) {
    try {
      const img = await toBlob(element);

      if (!img) {
        toast.error('Ooops! Ha habido un problema generando la imagen');
        return;
      }

      await uploadTicket(providerId, ticketId, img);

      const url = `${import.meta.env.VITE_WEBSITE_URL}?id=${ticketId}`;
      navigator.clipboard.writeText(url);

      const message = import.meta.env.VITE_HACKAFOR_X_MSG
        ? `${import.meta.env.VITE_HACKAFOR_X_MSG}`
        : 'Este es tu ticket exclusivo para el evento de la Hackafor, habrá premios y sorteos. ¡Te esperamos!';

      const text = encodeURIComponent(message);
      const encodedUrl = encodeURIComponent(url);
      const hashtags = encodeURIComponent('Hackafor');

      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}&hashtags=${hashtags}`;

      window.open(twitterUrl, '_blank');
    } catch (error) {
      console.error('Could not capture image:', error);
    }
  }
};

export const Ticket: FC<TicketProps> = ({
  name = 'tpicj aforcita',
  number = 1,
  avatar = 'https://www.figma.com/file/oB8OIzcBcSUIBXDmmp46mb/image/553aae256d49bfd7691b401b30ec005149d24fd6'
}) => {
  const user = useUserStore((state) => state.user);
  const ticketRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardFooterRef = useRef<HTMLDivElement>(null);

  const resizeAndCallShareTwitter = async (
    elementRef: RefObject<HTMLElement>,
    cardElementRef: RefObject<HTMLDivElement>,
    cardFooterElementRef: RefObject<HTMLDivElement>,
    ticketId: string | null,
    providerId: string | null
  ) => {
    if (elementRef.current && cardElementRef.current && cardFooterElementRef.current) {
      const atroposElement = document.querySelector('.atropos') as HTMLElement;

      const originalCardPaddingBottom = cardElementRef.current.style.paddingBottom;
      const originalAtroposHeight = atroposElement?.style.height;
      const originalAtroposWidth = atroposElement?.style.width;
      const originalCardFooterAlignItems = cardFooterElementRef.current.style.alignItems;

      cardElementRef.current.style.paddingBottom = '70px';
      if (atroposElement) {
        atroposElement.style.height = '403px';
        atroposElement.style.width = '720px';
      }
      cardFooterElementRef.current.style.alignItems = 'center';

      try {
        await shareTwitter(elementRef.current, ticketId, providerId);
      } finally {
        cardElementRef.current.style.paddingBottom = originalCardPaddingBottom || '';
        if (atroposElement) {
          atroposElement.style.height = originalAtroposHeight || '';
          atroposElement.style.width = originalAtroposWidth || '';
        }
        cardFooterElementRef.current.style.alignItems = originalCardFooterAlignItems || '';
      }
    }
  };

  return (
    <section>
      <div className="container mx-auto my-20">
        <h2 className="text-[30px] text-center">Descarga tu ticket y compártelo en redes sociales</h2>
        <div className="flex justify-center md:w-full mx-auto mt-15 p-2 md:p-0">
          <Atropos
            shadowScale={1.1}
            innerClassName="rounded-2xl"
            className="h-[175px] w-[720px] bg-transparent mx-auto sm:h-[310px] rounded-2xl shadow-[0_0px_90px_-10px_#c138b830] hover:shadow-none"
          >
            <div className="ticket-bg w-full flex h-full rounded-2xl border-2 border-[#171717]" id="ticket" ref={ticketRef}>
              <div
                className="flex flex-col col-span-6 justify-between p-4 sm:p-[30px] sm:pb-[17px] w-full rounded-2xl bg-cBlack rounded-tr-0 rounded-rb-0"
                ref={cardRef}
              >
                <div className="flex gap-5 items-center">
                  <img
                    data-atropos-offset="2"
                    className="w-14 sm:w-27 aspect-square rounded-full p-[0.1rem] bg-gradient-to-rb from-primary-600 to-secondary-500"
                    src={avatar}
                    id="avatar"
                    alt={`Avatar de ${name}`}
                  />
                  <div className="flex flex-col gap-3 justify-center">
                    <h3
                      title={name}
                      data-atropos-offset="3"
                      className={`flex font-bold text-lg sm:text-3xl md:${name.length > 15 ? 'text-2xl' : 'text-4xl'}`}
                    >
                      {name}
                    </h3>
                    <span data-atropos-offset="4" className={`flex gap-1 items-center`}>
                      <span className="i-bi-twitch text-xl" />
                      <p className="font-bold text-[0.7rem] md:text-lg">twitch.tv/afor_digital</p>
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-end" ref={cardFooterRef}>
                  <div data-atropos-offset="3" className="flex gap-1 items-end gap-4">
                    <p className="flex flex-col items-center text-xs sm:text-[28px] leading-tight">
                      <span className="font-100">NOV</span>
                      <span className="font-bold">20</span>
                    </p>
                    <div>
                      <div className="flex">
                        {sponsors.map((sponsor) => (
                          <img
                            key={sponsor.name}
                            className="w-7 sm:w-14 aspect-square rounded-full"
                            src={sponsor.logo}
                            alt={`Logo de ${sponsor.name}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p data-atropos-offset="8" className="text-xs sm:text-[28px] leading-none">
                    #{number.toString().padStart(5, '0')}
                  </p>
                </div>
              </div>

              <div className="w-35 sm:w-80 h-full flex items-center justify-center bg-gradient-to-rb from-primary-600 to-secondary-500 rounded-2xl rounded-lt-0 rounded-lb-0">
                <img
                  data-atropos-offset="5"
                  className="w-full p-3 sm:p-7 invert-100"
                  src="./images/hackafor_year.webp"
                  alt="Hackafor 2024 Announcement Logo"
                />
              </div>
            </div>
          </Atropos>
        </div>
        {!user ? null : (
          <div className="flex justify-center gap-x-5 mt-10">
            <Button
              onClick={() => {
                resizeAndCallShareTwitter(ticketRef, cardRef, cardFooterRef, number.toString(), user?.id);
              }}
              hasBorder
              variant={Variant.secondary}
            >
              <div className="flex gap-2 items-center">
                <span className="i-bi-twitter-x"></span>
                <span>Compartir</span>
              </div>
            </Button>
            <Button
              onClick={() => {
                downloadTicket(ticketRef, number.toString(), user?.id);
              }}
              variant={Variant.ghost}
            >
              <div className="flex gap-2 items-center">
                <span className="i-lucide-arrow-down bg-gradient-to-b from-secondary-500 to-primary-600"></span>
                <span>Descargar Ticket</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
