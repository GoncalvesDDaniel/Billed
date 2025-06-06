/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from "@testing-library/dom";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            //to-do write expect expression
            const windowIconClass = windowIcon.classList;
            expect(windowIconClass).toContain("active-icon");
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => new Date(b) - new Date(a);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });

    describe("When user interate", () => {
        test("Then clicking the New Bill button should show NewBill form", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee" })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);

            const newBillButton = screen.getByTestId("btn-new-bill");
            expect(newBillButton).toBeTruthy();
            userEvent.click(newBillButton);

            await waitFor(() => screen.getByText("Envoyer une note de frais"));
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        });
        test("Then clicking an eye icon should display the modal", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee" })
            );

            document.body.innerHTML = BillsUI({ data: bills });

            $.fn.modal = jest.fn();

            const newBill = new Bills({
                document,
                onNavigate: jest.fn(),
                store: null,
                localStorage: window.localStorage,
            });

            const handleClickIconEyeSpy = jest.spyOn(
                newBill,
                "handleClickIconEye"
            );

            const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];
            userEvent.click(firstEyeIcon);

            expect(handleClickIconEyeSpy).toHaveBeenCalledTimes(1);
            expect(handleClickIconEyeSpy).toHaveBeenCalledWith(firstEyeIcon);

            expect($.fn.modal).toHaveBeenCalledTimes(1);
            expect($.fn.modal).toHaveBeenCalledWith("show");

            handleClickIconEyeSpy.mockRestore();
        });
    });

    describe("When UI is update", () => {
        test("Then getBills method should be called", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee" })
            );
            const mockedStore = store;

            const newBill = new Bills({
                document,
                onNavigate: jest.fn(),
                store: mockedStore,
                localStorage: window.localStorage,
            });

            const bills = await newBill.getBills();
            expect(bills.length).toBe(4);
        });
    });
});
