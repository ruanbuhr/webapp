import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Image
            src="/shopleft-logo.png"
            alt="SHOPLEFT Logo"
            width={150}
            height={50}
            className="mb-2"
          />
          <p className="text-gray-400">Customer Support:</p>
          <p className="font-semibold">(021) 783 9876</p>
          <p className="text-gray-400">
            58 Boom Street, Parys, 9585,
            <br />
            Free State, South Africa
          </p>
          <p>info@shopleft.co.za</p>
        </div>

        <div>
          <h3 className="font-bold mb-2">TOP CATEGORIES</h3>
          <ul className="space-y-1 text-gray-400">
            <li>Computer & Laptop</li>
            <li>SmartPhone</li>
            <li>Headphone</li>
            <li>Camera & Photo</li>
            <li>TV & Home</li>
            <li className="text-yellow-400 cursor-pointer">
              Browse All Products →
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-2">QUICK LINKS</h3>
          <ul className="space-y-1 text-gray-400">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/cart">Shopping Cart</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-2">DOWNLOAD APP</h3>
          <div className="flex flex-col gap-6">
            <Button
              variant="secondary"
              className="justify-start bg-gray-800 text-white px-4 py-7 rounded-xl max-w-xs"
            >
              <div className="flex items-center gap-4 w-full">
                <Image
                  src="/google-play.png"
                  alt="Google Play"
                  width={32}
                  height={32}
                  className="mr-4"
                />
                <div className="text-left">
                  <p className="text-xs leading-none">Get it now</p>
                  <p className="font-semibold text-sm">Google Play</p>
                </div>
              </div>
            </Button>
            <Button
              variant="secondary"
              className="justify-start bg-gray-800 text-white px-4 py-7 rounded-xl max-w-xs"
            >
              <div className="flex items-center gap-4 w-full">
                <Image
                  src="/apple.png"
                  alt="App Store"
                  width={32}
                  height={32}
                  className="mr-4"
                />
                <div className="text-left">
                  <p className="text-xs leading-none">Get it now</p>
                  <p className="font-semibold text-sm">App Store</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-400">
        This is a webapp built specifically for demo purposes, designed by Ruan
        Buhr, David Genders, and Chris Klopper.
      </div>
    </footer>
  );
}
